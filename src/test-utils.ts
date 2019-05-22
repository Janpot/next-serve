import { createServer, Server, RequestListener } from 'http';
import { promisify } from 'util';
import * as getPort from 'get-port';

async function close(server: Server) {
  return promisify(server.close.bind(server))();
}

async function listen(app: Server, port: number = 3000) {
  return new Promise<Server>((resolve, reject) => {
    const server = app.listen(port, (err?: Error) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(server);
      }
    });
  });
}

const openServers: Server[] = [];

afterEach(async () => {
  const toCLose = openServers.splice(0);
  return Promise.all(toCLose.map(close));
});

export async function createHandler(handler: RequestListener) {
  const port = await getPort();
  const server = await listen(createServer(handler), port);
  openServers.push(server);
  return {
    port
  };
}
