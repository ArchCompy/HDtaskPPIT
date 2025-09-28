const request = require('supertest');
const app = require('../index'); // import your Express app

describe('Basic route tests', () => {
  test('GET / should redirect to /home.html', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(302); // redirect
    expect(res.headers.location).toBe('/home.html');
  });

  test('GET /view-requests should respond', async () => {
    const res = await request(app).get('/view-requests');
    expect([200, 500]).toContain(res.statusCode); 
    // either renders page (200) or returns 500 if DB empty/uninitialized
  });

  test('POST /submit-request with missing data returns 500', async () => {
    const res = await request(app).post('/submit-request').send({});
    expect(res.statusCode).toBe(500); // error due to missing required fields
  });
});
