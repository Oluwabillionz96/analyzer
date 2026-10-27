// TS's DOM lib does not declare ReadableStream as async-iterable
// (microsoft/TypeScript#40594). Browsers implement it; this type
// augmentation lets `for await (const chunk of response.body)` typecheck.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ReadableStream<R = any> {
  [Symbol.asyncIterator](): AsyncIterableIterator<R>;
}