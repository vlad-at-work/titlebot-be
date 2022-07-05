import request from 'supertest';
import { expect } from 'chai';
import { app } from '../server.js';

const EXPECTED_ERROR = { error: 'invalid URL' };

describe('test api url', () => {
  describe('POST /title', () => {
    it('should confirm text vlad in page title', async () => {
      const response = await request(app)
        .post('/title')
        .set('content-type', 'application/json')
        .send({ url: 'https://vlad.ai/' });
      expect(response.statusCode).to.equal(200);
      expect(response.body.title).to.contain('vlad.ai');
      return response;
    });

    it('should return an error an error when given improper url', async () => {
      const response = await request(app)
        .post('/title')
        .set('content-type', 'application/json')
        .send({ url: 'banana' });

      expect(response.statusCode).to.equal(400);
      expect(response.body).to.deep.equal(EXPECTED_ERROR);
      return response;
    });
  });
});
