/**
 * Jest 폴리필 설정
 * MSW 2.x를 jsdom 환경에서 사용하기 위한 폴리필
 */

const { TextDecoder, TextEncoder } = require('util');
const { ReadableStream, TransformStream } = require('stream/web');
const { MessageChannel, MessagePort } = require('worker_threads');

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  TransformStream: { value: TransformStream },
  MessageChannel: { value: MessageChannel },
  MessagePort: { value: MessagePort },
});

const { fetch, Headers, Request, Response } = require('undici');

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  Headers: { value: Headers },
  Request: { value: Request },
  Response: { value: Response },
});
