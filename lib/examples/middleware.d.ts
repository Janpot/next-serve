/// <reference types="node" />
import { RequestHandler, RequestContext } from '../index';
export declare function withAuthentication<C extends RequestContext>(handler: RequestHandler<C & {
    user: string;
}>): RequestHandler<C>;
export declare function withServerTiming(handler: RequestHandler): RequestHandler;
declare const _default: import("http").RequestListener;
export default _default;
