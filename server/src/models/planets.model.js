const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const planets = require('./planets.mongo');

const habitablePlanets = [];

function loadPlanets() {
  return new Promise((resolve, reject) => {
    function isHabitablePlanet(planet) {
      return (
        planet['koi_disposition'] === 'CONFIRMED' &&
        planet['koi_insol'] > 0.36 &&
        planet['koi_insol'] < 1.11 &&
        planet['koi_prad'] < 1.6
      );
    }

    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    )
      .pipe(
        parse({
          comment: '#',
          columns: true,
        })
      )
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          await savePlanets(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject();
      })
      .on('end', async () => {
        const countPlanets = (await getAllPlanets()).planets.length;
        console.log(`${countPlanets} habitable planets found!`);
        resolve();
      });
  });
}

async function savePlanets(planet) {
  await planets.updateOne(
    {
      keplerName: planet.kepler_name,
    },
    {
      keplerName: planet.kepler_name,
    },
    {
      upsert: true,
    }
  );
}

async function getAllPlanets() {
  const res = await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
  return {
    planets: res,
  };
}

module.exports = {
  planets: habitablePlanets,
  getAllPlanets,
  loadPlanets,
};
