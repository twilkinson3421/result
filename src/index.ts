/** Represents an OK result case */
export type Ok<T = unknown> = { ok: true } & T;
/** Represents an error result case */
export type Err<E = unknown> = { ok: false } & E;

/** Represents a result case, either OK or error */
export type Result<T = unknown, E = unknown> = Ok<T> | Err<E>;

/** Represents a result possibly containing a caught error */
export type Caught<T = unknown, E = unknown> = Result<{ value: T }, { caught: E }>;

/** Creates an OK result */
export function ok(): Ok;
export function ok<T extends object>(value: T): Ok<T>;
export function ok<T extends object>(value?: T): Ok | Ok<T>;
export function ok(value?: object): Ok {
    return { ok: true, ...value };
}

/** Creates an error result */
export function err(): Err;
export function err<E extends object>(error: E): Err<E>;
export function err<E extends object>(error?: E): Err | Err<E>;
export function err(error?: object): Err {
    return { ok: false, ...error };
}

/** Returns an OK result if the given value is truthy, otherwise an error result */
export function when(isOk: true): Ok;
export function when(isOk: false): Err;
export function when(isOk: boolean): Result;
export function when<T extends object>(isOk: true, value: T): Ok<T>;
export function when<T extends object>(isOk: true, value?: T): Ok | Ok<T>;
export function when<E extends object>(isOk: false, error: E): Err<E>;
export function when<E extends object>(isOk: false, error?: E): Err | Err<E>;
export function when<T extends object>(isOk: boolean, value: T): Result<T, T>;
export function when<T extends object>(isOk: boolean, value?: T): Result | Result<T, T>;
export function when(isOk: boolean, value?: object): Result {
    return isOk ? ok(value) : err(value);
}

/** Returns the result if it is OK, otherwise throws the value passed to `elseThrow` */
export function unwrap<T>(result: Result<T>, elseThrow?: unknown): Ok<T> {
    if (result.ok) return result;
    else throw elseThrow ?? new Error("Error was unwrapped");
}

/** Asserts that the result is OK, otherwise throws the value passed to `elseThrow` */
export function assert<T>(result: Result<T>, elseThrow?: unknown): asserts result is Ok<T> {
    if (result.ok) return;
    else throw elseThrow ?? new Error("Error was asserted");
}

/** Returns an OK result if no error was caught, otherwise an error result */
export async function catchErr<T>(cb: () => T): Promise<Caught<Awaited<T>, unknown>>;
export async function catchErr<T, E>(
    cb: () => T,
    test: (caught: unknown) => caught is E
): Promise<Caught<Awaited<T>, E>>;
export async function catchErr(
    cb: () => unknown,
    test?: (caught: unknown) => boolean
): Promise<Result> {
    try {
        return ok({ value: await cb() });
    } catch (caught) {
        if (test?.(caught)) return err({ caught });
        throw caught;
    }
}

/** Returns an OK result if no error was caught, otherwise an error result */
export function catchErrSync<T>(cb: () => T): Caught<T, unknown>;
export function catchErrSync<T, E>(
    cb: () => T,
    test: (caught: unknown) => caught is E
): Caught<T, E>;
export function catchErrSync(cb: () => unknown, test?: (caught: unknown) => boolean): Result {
    try {
        return ok({ value: cb() });
    } catch (caught) {
        if (test?.(caught)) return err({ caught });
        throw caught;
    }
}
