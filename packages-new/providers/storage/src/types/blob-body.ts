import { Readable } from 'node:stream';

export type BlobBody = Buffer | Readable | ReadableStream;
