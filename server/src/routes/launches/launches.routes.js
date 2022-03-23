const express = require('express');

const {
  getLaunches,
  addNewLaunches,
  abortLaunch,
} = require('./launches.controller');
const router = express.Router();

router.get('/', getLaunches);
router.post('/', addNewLaunches);
router.delete('/:id', abortLaunch);

module.exports = router;
