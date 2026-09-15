declare module 'js-yaml' {
  function load(input: string | Buffer): unknown
  function dump(data: unknown, options?: unknown): string
}
