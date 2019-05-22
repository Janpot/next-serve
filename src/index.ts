import {
  IncomingMessage,
  ServerResponse,
  IncomingHttpHeaders,
  RequestListener
} from 'http';
import {
  Request,
  Headers,
  BodyInit,
  Response as ResponseOriginal,
  ResponseInit as ResponseInitOriginal,
  Body
} from 'node-fetch';
import { URL } from 'url';
import { Stream, pipeline } from 'stream';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type ResponseInit = Omit<ResponseInitOriginal, 'url'>;

/**
 * The Response interface of the Fetch API represents the response to a request.
 */
class Response extends ResponseOriginal {
  /**
   * returns a `Response` resulting in a redirect to the specified URL.
   * @param url The URL that the new response is to originate from.
   * @param status An optional status code for the response (e.g., 302.)
   * @returns the resulting `Response`.
   */
  static redirect(url: string, status: number = 301): Response {
    // Validate the url by parsing it, but pass the original value to the header.
    new URL(url, 'http://0.0.0.0/');
    return new Response(undefined, {
      status,
      headers: {
        location: url
      }
    });
  }

  /**
   * returns a `Response` with a JSON body.
   * @param body The body that will be serialized to JSON.
   * @returns the resulting `Response`.
   */
  static json(body: any) {
    return new Response(JSON.stringify(body), {
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  /**
   * creates a new Response object.
   * @param body An object defining a body for the response.
   * @param init An options object containing any custom settings that you want to apply to the response.
   */
  constructor(body?: BodyInit, init?: ResponseInit) {
    super(body, { ...init, url: '' });
  }
}

// type NextApiFunction = (req: IncomingMessage, res: ServerResponse) => void;

export type RequestContext = {
  request: Request;
};
type RequestHandler<Context extends RequestContext = RequestContext> = (
  RequestContext: Context
) => Response | Promise<Response>;

/**
 * Flattens an array 1 level deep.
 * @param array array to flatten.
 */
function flat<T>(array: (T | T[])[]): T[] {
  const result = [];
  for (const elm of array) {
    if (Array.isArray(elm)) {
      result.push(...elm);
    } else {
      result.push(elm);
    }
  }
  return result;
}

/**
 * Converts node.js headers object into a fetch API `Headers` object.
 * @param nodeHeaders headers in node.js format.
 */
function headersFromNodeHeaders(nodeHeaders: IncomingHttpHeaders) {
  return new Headers(
    flat(
      Object.entries(nodeHeaders).map(([name, value]) => {
        if (Array.isArray(value)) {
          return value.map(val => [name, val]);
        } else if (typeof value === 'string') {
          return [[name, value]];
        } else {
          return [];
        }
      })
    )
  );
}

interface ProtocolAndHost {
  protocol?: string;
  host?: string;
}

/**
 * parse host and protocol from the `Forwarded` header value.
 * @param header the `Forwarded` header value.
 */
function parseForwardedHeader(header?: string): ProtocolAndHost {
  if (!header) {
    return {};
  }
  const mapInit = header.split(',').map(pairStr => {
    return <[string, string | undefined]>(
      pairStr.split('=').map(str => str.trim().toLowerCase())
    );
  });
  const values = new Map(mapInit);
  return {
    protocol: values.get('proto'),
    host: values.get('host')
  };
}

/**
 * Returns the first value it finds of this header
 * @param header node.js header value.
 */
function firstHeaderValue(header?: string | string[]): string | undefined {
  if (!header) {
    return undefined;
  } else if (Array.isArray(header)) {
    return header[0];
  } else {
    return header;
  }
}

/**
 * Tries to parse the protocol and host from an incoming message
 * @param req node.js handler incoming message.
 * @returns parsed protocol and host
 */
function parseProtocolAndHost(req: IncomingMessage): ProtocolAndHost {
  const forwarded = parseForwardedHeader(req.headers.forwarded);
  const protocol =
    forwarded.protocol || firstHeaderValue(req.headers['x-forwarded-proto']);
  const host =
    forwarded.host ||
    firstHeaderValue(req.headers['x-forwarded-host']) ||
    req.headers.host;
  return { protocol, host };
}

/**
 * Tries to parse the url as specified by the originating fetch.
 * @param req node.js handler incoming message.
 * @returns parsed url with protocol and host set.
 */
function parseUrlFromRequest(req: IncomingMessage): URL {
  const { protocol, host } = parseProtocolAndHost(req);
  const baseUrl = new URL('http://0.0.0.0/');
  if (protocol) {
    baseUrl.protocol = protocol;
  }
  if (host) {
    baseUrl.host = host;
  }
  return new URL(req.url || '/', baseUrl);
}

/**
 * Transforms a node.js style request object to a fetch API request object.
 * @param req node.js handler incoming message.
 * @returns resulting fetch `Request` object.
 */
function requestFromIncomingMessage(req: IncomingMessage) {
  const url = parseUrlFromRequest(req);
  return new Request(url, {
    method: req.method,
    body: req.method === 'HEAD' || req.method === 'GET' ? undefined : req,
    headers: headersFromNodeHeaders(req.headers)
  });
}

/**
 * Forwards the response of the fetch style API to the node style API.
 * @param response fetch Response object.
 * @param res node.js response provided to a http handler.
 */
function forwardResponse(response: Response, res: ServerResponse) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  if (response.body instanceof Stream) {
    pipeline(response.body, res, () => {});
  } else {
    res.end(response.body);
  }
}

/**
 * Creates a node.js http handler from a fetch absed handler.
 * @param handler a function that will handle incoming requests
 */
export function serve(handler: RequestHandler): RequestListener {
  return (req: IncomingMessage, res: ServerResponse) => {
    const request = requestFromIncomingMessage(req);
    Promise.resolve(handler({ request })).then(
      response => {
        forwardResponse(response, res);
      },
      error => {
        res.statusCode = 500;
        res.end();
      }
    );
  };
}

export { Request, Headers, Response, RequestHandler };
