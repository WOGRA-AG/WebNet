import {MnistData} from './data.js';

const Backend = {
    WEB_GPU: 'webgpu',
    WEB_GL: 'webgl',
    CPU: 'cpu'
}

async function showExamples(data) {
    // Create a container in the visor
    const surface = tfvis.visor().surface({name: 'Input Data Examples', tab: 'Input Data'});

    // Get the examples
    const examples = data.nextTestBatch(20);
    const numExamples = examples.xs.shape[0];

    // Create a canvas element to render each example
    for (let i = 0; i < numExamples; i++) {
        const imageTensor = tf.tidy(() => {
            // Reshape the image to 28x28 px
            return examples.xs
                .slice([i, 0], [1, examples.xs.shape[1]])
                .reshape([28, 28, 1]);
        });

        const canvas = document.createElement('canvas');
        canvas.width = 28;
        canvas.height = 28;
        canvas.style = 'margin: 4px;';
        await tf.browser.toPixels(imageTensor, canvas);
        surface.drawArea.appendChild(canvas);

        imageTensor.dispose();
    }
}

async function train(backend, data) {
    await tf.setBackend(backend);
    await tf.ready();
    const {BATCH_SIZE, trainXs, trainYs, testXs, testYs} = prepData(backend, data);
    const model = getModel();
    // tfvis.show.modelSummary({name: 'Model Architecture', tab: backend}, modelWebGPU);

    // const time = await tf.time(async () => await model.fit(trainXs, trainYs, {
    //         batchSize: BATCH_SIZE, validationData: [testXs, testYs], epochs: 100, shuffle: true
    //     }
    //     // callbacks: fitCallbacks
    // ));
    const startTime = performance.now();
    await model.fit(trainXs, trainYs, {
            batchSize: BATCH_SIZE, validationData: [testXs, testYs], epochs: 100, shuffle: true            //, callbacks: fitCallbacks
        }
    )
    const endTime = performance.now();
    const totalTimeInMilliseconds = endTime - startTime;
    // await showAccuracy(model, data, backend);
    // await showConfusion(model, data, backend);
    return totalTimeInMilliseconds;
}

function getModel() {
    const model = tf.sequential();

    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;
    const IMAGE_CHANNELS = 1;

    // In the first layer of our convolutional neural network we have
    // to specify the input shape. Then we specify some parameters for
    // the convolution operation that takes place in this layer.
    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
        kernelSize: 5,
        filters: 8,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));

    // The MaxPooling layer acts as a sort of downsampling using max values
    // in a region instead of averaging.
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    // Repeat another conv2d + maxPooling stack.
    // Note that we have more filters in the convolution.
    model.add(tf.layers.conv2d({
        kernelSize: 5, filters: 16, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten());

    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
    const NUM_OUTPUT_CLASSES = 10;
    model.add(tf.layers.dense({
        units: NUM_OUTPUT_CLASSES, kernelInitializer: 'varianceScaling', activation: 'softmax'
    }));


    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
        optimizer: optimizer, loss: 'categoricalCrossentropy', metrics: ['accuracy'],
    });

    return model;
}

function prepData(backend, data) {
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    // const container = {
    //     name: 'Model Training', tab: backend, styles: {height: '1000px'}
    // };
    // const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

    const BATCH_SIZE = 512;
    const TRAIN_DATA_SIZE = 5000;
    const TEST_DATA_SIZE = 1000;

    const [trainXs, trainYs] = tf.tidy(() => {
        const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
        return [d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]), d.labels];
    });

    const [testXs, testYs] = tf.tidy(() => {
        const d = data.nextTestBatch(TEST_DATA_SIZE);
        return [d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]), d.labels];
    });
    return {BATCH_SIZE, trainXs, trainYs, testXs, testYs};
}

function doPrediction(model, data, testDataSize = 500) {
    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;
    const testData = data.nextTestBatch(testDataSize);
    const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
    const labels = testData.labels.argMax(-1);
    const preds = model.predict(testxs).argMax(-1);

    testxs.dispose();
    return [preds, labels];
}


async function showAccuracy(model, data, backend) {
    const [preds, labels] = doPrediction(model, data);
    const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
    const container = {name: 'Accuracy', tab: backend};
    tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

    labels.dispose();
}

async function showConfusion(model, data, backend) {
    const [preds, labels] = doPrediction(model, data);
    const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
    const container = {name: 'Confusion Matrix', tab: backend};
    tfvis.render.confusionMatrix(container, {values: confusionMatrix, tickLabels: classNames});

    labels.dispose();
}

async function startTraining(backend) {
    const data = new MnistData();
    await data.load();
    const time = await train(backend, data);
    const statsContainer = document.getElementById(`${backend.toLowerCase()}-stats`);
    const minutes = Math.floor(time / 60000);
    const seconds = ((time % 60000) / 1000).toFixed(0);
    statsContainer.innerHTML = `
    <h2>Performance</h2>
    <ul>
    <li>Total Training Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}</li>
      // <li>kernelMs: ${time.kernelMs}</li>
      // <li>wallTimeMs: ${time.wallMs}</li>
      // <li>uploadWaitMs: ${time.uploadWaitMs}</li>
      // <li>downloadWaitMs: ${time.downloadWaitMs}</li>
    </ul>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('webgpu-button').addEventListener('click', () => startTraining(Backend.WEB_GPU));
    document.getElementById('webgl-button').addEventListener('click', () => startTraining(Backend.WEB_GL));
    document.getElementById('cpu-button').addEventListener('click', () => startTraining(Backend.CPU));
});

