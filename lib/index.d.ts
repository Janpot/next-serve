/// <reference types="node" />
import { RequestListener } from 'http';
import { Request, Headers, BodyInit, Response as ResponseOriginal, ResponseInit as ResponseInitOriginal } from 'node-fetch';
declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
declare type ResponseInit = Omit<ResponseInitOriginal, 'url'>;
declare class Response extends ResponseOriginal {
    static redirect(url: string, status?: number): Response;
    static json(body: any): Response;
    constructor(body?: BodyInit, init?: ResponseInit);
}
export declare type RequestContext = {
    request: Request;
};
declare type RequestHandler<Context extends RequestContext = RequestContext> = (RequestContext: Context) => Response | Promise<Response>;
export declare function serve(handler: RequestHandler): RequestListener;
export { Request, Headers, Response, RequestHandler };
