const express = require('express');

const planetRouter = require('./routes/planets/planets.router');
const launchRouter = require('./routes/launches/launches.routes');

const api = express.Router();

api.use('/planets', planetRouter);
api.use('/launches', launchRouter);

module.exports = api;
