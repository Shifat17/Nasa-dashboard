const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;

const demoLaunch = {
  flightNumber: 100,
  mission: 'Kepler Exploration b',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2023'),
  target: 'Kepler-442 b',
  customers: ['ZTM', 'NASA'],
  upcoming: true,
  success: false,
};

launches.set(demoLaunch.flightNumber, demoLaunch);

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error('No matching planets found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = {
    ...launch,
    upcoming: true,
    customers: ['Zero to M', 'Nasa'],
    flightNumber: newFlightNumber,
    success: false,
  };

  await saveLaunches(newLaunch);
  return newLaunch;
}
async function ifLaunchExist(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function abortLaunchById(id) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1 && aborted.matchedCount === 1;
}

async function saveLaunches(launch) {
  const res = await launchesDatabase.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  const res = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  const launchDocs = res.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };

    console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunches(launch);
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('launch already exists');
    return;
  }
  //TODO poplulate launches data
  return await populateLaunches();
}

module.exports = {
  launches,
  getAllLaunches,
  loadLaunchesData,
  saveLaunches,
  demoLaunch,
  scheduleNewLaunch,
  ifLaunchExist,
  abortLaunchById,
};
