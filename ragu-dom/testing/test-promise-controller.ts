export class TestPromiseController<T> {
  readonly promise: Promise<T>;
  resolve!: (value?: T) => void;
  reject!: (err?: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = (...args: any[]) => {
        setImmediate(() => {
          reject(...args);
        });
      }
    });
  }
}
