"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
exports.Request = node_fetch_1.Request;
exports.Headers = node_fetch_1.Headers;
const url_1 = require("url");
const stream_1 = require("stream");
class Response extends node_fetch_1.Response {
    static redirect(url, status = 301) {
        new url_1.URL(url, 'http://0.0.0.0/');
        return new Response(undefined, {
            status,
            headers: {
                location: url
            }
        });
    }
    static json(body) {
        return new Response(JSON.stringify(body), {
            headers: {
                'content-type': 'application/json'
            }
        });
    }
    constructor(body, init) {
        super(body, Object.assign({}, init, { url: '' }));
    }
}
exports.Response = Response;
function flat(array) {
    const result = [];
    for (const elm of array) {
        if (Array.isArray(elm)) {
            result.push(...elm);
        }
        else {
            result.push(elm);
        }
    }
    return result;
}
function headersFromNodeHeaders(nodeHeaders) {
    return new node_fetch_1.Headers(flat(Object.entries(nodeHeaders).map(([name, value]) => {
        if (Array.isArray(value)) {
            return value.map(val => [name, val]);
        }
        else if (typeof value === 'string') {
            return [[name, value]];
        }
        else {
            return [];
        }
    })));
}
function parseForwardedHeader(header) {
    if (!header) {
        return {};
    }
    const mapInit = header.split(',').map(pairStr => {
        return (pairStr.split('=').map(str => str.trim().toLowerCase()));
    });
    const values = new Map(mapInit);
    return {
        protocol: values.get('proto'),
        host: values.get('host')
    };
}
function firstHeaderValue(header) {
    if (!header) {
        return undefined;
    }
    else if (Array.isArray(header)) {
        return header[0];
    }
    else {
        return header;
    }
}
function parseProtocolAndHost(req) {
    const forwarded = parseForwardedHeader(req.headers.forwarded);
    const protocol = forwarded.protocol || firstHeaderValue(req.headers['x-forwarded-proto']);
    const host = forwarded.host ||
        firstHeaderValue(req.headers['x-forwarded-host']) ||
        req.headers.host;
    return { protocol, host };
}
function parseUrlFromRequest(req) {
    const { protocol, host } = parseProtocolAndHost(req);
    const baseUrl = new url_1.URL('http://0.0.0.0/');
    if (protocol) {
        baseUrl.protocol = protocol;
    }
    if (host) {
        baseUrl.host = host;
    }
    return new url_1.URL(req.url || '/', baseUrl);
}
function requestFromIncomingMessage(req) {
    const url = parseUrlFromRequest(req);
    return new node_fetch_1.Request(url, {
        method: req.method,
        body: req.method === 'HEAD' || req.method === 'GET' ? undefined : req,
        headers: headersFromNodeHeaders(req.headers)
    });
}
function forwardResponse(response, res) {
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body instanceof stream_1.Stream) {
        stream_1.pipeline(response.body, res, () => { });
    }
    else {
        res.end(response.body);
    }
}
function serve(handler) {
    return (req, res) => {
        const request = requestFromIncomingMessage(req);
        Promise.resolve(handler({ request })).then(response => {
            forwardResponse(response, res);
        }, error => {
            res.statusCode = 500;
            res.end();
        });
    };
}
exports.serve = serve;
