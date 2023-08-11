// tensors
const a = tf.tensor([1, 2, 3]);
const b = tf.tensor([4, 5, 6]);
const c = a.add(b);
c.print()

// variables
const vtensor = tf.variable(a);
vtensor.print();

// operations
tf.tidy(() => {
    const tensor_a = tf.keep(tf.tensor3d([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [5, 3, 1], 'int32'));
    const tensor_b = tf.keep(tf.tensor3d([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [5, 3, 1], 'int32'));
    const tensor_c = tensor_a.sub(tensor_b.transpose());
    tensor_c.print();
});

// memory
console.log(tf.memory().numTensors);
b.dispose();
console.log(tf.memory().numTensors);

// layers api
const model = tf.sequential();

const hidden = tf.layers.dense({units: 4, inputShape: [2], activation: 'linear'});
model.add(hidden);

const output = tf.layers.dense({units: 3, activation: 'sigmoid'});
model.add(output);

model.compile({
    optimizer: tf.train.sgd(0.1),
    loss: tf.losses.meanSquaredError
});

const xs = tf.tensor2d([[0.25, 0.92], [0.75, 0.54], [0.245, 0.94], [0.1, 0.24]]);
const ys = tf.tensor2d([[0.25, 0.92, 0.21], [0.0534, 0.52, 0.61], [0.545, 0.012, 0.12], [0.01, 0.21, 0.63]]);
const history = await model.fit(xs, ys);
console.log(history.history.loss[0]);

let outputs = model.predict(xs);
outputs.print();
