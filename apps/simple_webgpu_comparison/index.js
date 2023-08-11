const WEB_GPU = 'webgpu';
const WEB_GL = 'webgl';

async function runExample() {
    // Run with WebGL backend
    await tf.setBackend(WEB_GL);
    await tf.ready();
    console.log('Running with WebGL backend');
    await performOperations(WEB_GL);

    // Run with WebGPU backend
    await tf.setBackend(WEB_GPU);
    await tf.ready();
    console.log('Running with WebGPU backend');
    await performOperations(WEB_GPU);
}

async function performOperations(backend) {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

    const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
    const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

    console.time(`Timer (${backend}): `);
    await model.fit(xs, ys, { epochs: 250});
    console.timeEnd(`Timer (${backend}): `);

    const result = model.predict(tf.tensor2d([20], [1, 1])).dataSync();
    console.log(`Prediction (${backend}): `, result);
}

(async () => {
    await runExample();
})().catch(console.error);