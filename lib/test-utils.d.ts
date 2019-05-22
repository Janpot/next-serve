/// <reference types="node" />
import { RequestListener } from 'http';
export declare function createHandler(handler: RequestListener): Promise<{
    port: number;
}>;
