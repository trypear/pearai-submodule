class AssertionError extends Error {
    constructor(message: string) {
      super(message);
      // Adding the stack info to error.
      // Inspired by: https://blog.dennisokeeffe.com/blog/2020-08-07-error-tracing-with-sentry-and-es6-classes
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AssertionError);
      } else {
        this.stack = new Error(message).stack;
      }
      this.name = "AssertionError";
    }
  }
  
  export function assert(condition: boolean, message: string): asserts condition {
      if (!condition) {
          throw new AssertionError(message);
      }
  };