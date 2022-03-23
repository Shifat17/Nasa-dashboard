const mongoose = require('mongoose');

const mongoURL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
  console.log('mongo Connection established');
});
mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(mongoURL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}
module.exports = {
  mongoConnect,
  mongoDisconnect,
};
