const {
  getAllLaunches,
  scheduleNewLaunch,
  ifLaunchExist,
  abortLaunchById,
} = require('../../models/launches.model');
const { getPagination } = require('../../services/query');

async function getLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function addNewLaunches(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: 'missing required launch property',
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date',
    });
  }

  const newLaunch = await scheduleNewLaunch(launch);
  return res.status(200).json(newLaunch);
}

async function abortLaunch(req, res) {
  const launchId = +req.params.id;
  const existLaunchWithId = await ifLaunchExist(launchId);
  if (!existLaunchWithId) {
    return res.status(404).json({
      error: 'launch not found',
    });
  }
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({ error: 'Launch not aborted' });
  }
  res.status(200).json({ ok: true });
}

module.exports = {
  getLaunches,
  addNewLaunches,
  abortLaunch,
};
