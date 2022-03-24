const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanets } = require('../../models/planets.model');

describe('Launches Api', () => {
  beforeAll(async function () {
    await mongoConnect();
    await loadPlanets();
  });

  afterAll(async function () {
    await mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app).get('/v1/launches');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Test POST /launches', () => {
    const completLaunchData = {
      mission: 'USA enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-442 b',
      launchDate: 'January 4, 2028',
    };

    const launchDataWithoutDate = {
      mission: 'USA enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-442 b',
    };

    const launchDataWithInvalidDate = {
      mission: 'USA enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-442 b',
      launchDate: 'root',
    };

    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completLaunchData)
        .expect('Content-Type', /json/)
        .expect(200);
      const requestDate = new Date(completLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test('It should respond with 400 error', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate);

      expect(response.body).toStrictEqual({
        error: 'missing required launch property',
      });
    });

    test('It should respond with 400 error', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
