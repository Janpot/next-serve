/* eslint-env jest */

import { serve, Response } from './index';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { createHandler } from './test-utils';

import middelware from './examples/middleware';

describe('serve', () => {
  it('handles basic requests', async () => {
    const { port } = await createHandler(
      serve(({ request }) => {
        return new Response('Hello world');
      })
    );
    const res = await fetch(`http://localhost:${port}/`);
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe('Hello world');
  });

  it('handles json', async () => {
    const { port } = await createHandler(
      serve(({ request }) => {
        return Response.json({
          hello: 'world'
        });
      })
    );
    const res = await fetch(`http://localhost:${port}/`);
    const body = await res.json();
    expect(body).toHaveProperty('hello', 'world');
  });

  it('handles redirects', async () => {
    const { port } = await createHandler(
      serve(({ request }) => {
        const { pathname } = new URL(request.url);
        switch (pathname) {
          case '/redirect':
            return new Response('Hello world');
          default:
            return Response.redirect('/redirect', 302);
        }
      })
    );
    const res = await fetch(`http://localhost:${port}/`);
    expect(res.url).toBe(`http://localhost:${port}/redirect`);
    const body = await res.text();
    expect(body).toBe('Hello world');
  });

  it('handles response streams', async () => {
    const { port } = await createHandler(
      serve(() => {
        const stream = fs.createReadStream(
          path.resolve(__dirname, './sample.json'),
          { encoding: 'utf8' }
        );
        return new Response(stream);
      })
    );
    const res = await fetch(`http://localhost:${port}/`);
    const body = await res.json();
    expect(body).toHaveProperty('hello', 'world');
  });

  it('handles JSON request bodies', async () => {
    const { port } = await createHandler(
      serve(async ({ request }) => {
        const body = await request.json();
        return Response.json({ method: request.method, body });
      })
    );
    const res = await fetch(`http://localhost:${port}/`, {
      method: 'POST',
      body: JSON.stringify({ hello: 'world' })
    });
    const body = await res.json();
    expect(body).toMatchObject({ method: 'POST', body: { hello: 'world' } });
  });
});
