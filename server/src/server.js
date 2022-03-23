const http = require('http');

require('dotenv').config();
const app = require('./app');
const {
  saveLaunches,
  demoLaunch,
  loadLaunchesData,
} = require('./models/launches.model');
const { loadPlanets } = require('./models/planets.models');
const { mongoConnect } = require('./services/mongo');
const PORT = process.env.PORT || 8000;

async function startServer() {
  await mongoConnect();
  await loadPlanets();
  await saveLaunches(demoLaunch);
  await loadLaunchesData();
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
}

startServer();
