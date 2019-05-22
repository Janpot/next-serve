/* eslint-env jest */

import fetch from 'node-fetch';
import { createHandler } from '../test-utils';
import middelware from './middleware';

describe('middleware', () => {
  it('handles logged out', async () => {
    const { port } = await createHandler(middelware);
    const res = await fetch(`http://localhost:${port}/`);
    expect(res.status).toBe(401);
  });

  it('handles logged in', async () => {
    const { port } = await createHandler(middelware);
    const res = await fetch(`http://localhost:${port}/`, {
      headers: {
        authorization: '123456'
      }
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('user', 'Johnny');
  });

  it('has server timings', async () => {
    const { port } = await createHandler(middelware);
    const res = await fetch(`http://localhost:${port}/`);
    expect(res.headers.get('server-timing')).toMatch(/^total;dur=\d+$/);
  });
});
