/** Represents an OK result case */
export type Ok<T = unknown> = { ok: true } & T;
/** Represents an error result case */
export type Err<E = unknown> = { ok: false } & E;

/** Represents a result case, either OK or error */
export type Result<T = unknown, E = unknown> = Ok<T> | Err<E>;

/** Represents a result possibly containing a caught error */
export type Caught<T = unknown, E = unknown> = Result<{ value: T }, { caught: E }>;

/** Extracts the OK case from a result */
export type CaseOk<T> = T extends Result<infer U> ? Ok<U> : never;

/** Extracts the error case from a result */
export type CaseErr<T> = T extends Result<unknown, infer E> ? Err<E> : never;

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

/** Returns the result if it is OK, otherwise throws the value returned from `elseThrow` */
export function unwrapSync<T, E>(
    result: Result<T, E>,
    elseThrow?: (result: Err<E>) => unknown,
): Ok<T> {
    if (result.ok) return result;
    else throw elseThrow?.(result) ?? new Error("Error was unwrapped");
}

/** Returns the result if it is OK, otherwise throws the value returned from `elseThrow` */
export async function unwrap<T, E>(
    result: Result<T, E>,
    elseThrow?: (result: Err<E>) => unknown,
): Promise<Ok<T>> {
    if (result.ok) return result;
    else throw await elseThrow?.(result) ?? new Error("Error was unwrapped");
}

/** Asserts that the result is OK, otherwise throws the value returned from `elseThrow` */
export function assert<T, E>(
    result: Result<T, E>,
    elseThrow?: (result: Err<E>) => unknown,
): asserts result is Ok<T> {
    if (result.ok) return;
    else throw elseThrow?.(result) ?? new Error("Error was asserted");
}

/** Returns an OK result if no error was caught, otherwise an error result */
export async function catchErr<T>(cb: () => T): Promise<Caught<Awaited<T>, unknown>>;
export async function catchErr<T, E>(
    cb: () => T,
    test: (caught: unknown) => caught is E,
): Promise<Caught<Awaited<T>, E>>;
export async function catchErr(
    cb: () => unknown,
    test?: (caught: unknown) => boolean,
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
    test: (caught: unknown) => caught is E,
): Caught<T, E>;
export function catchErrSync(cb: () => unknown, test?: (caught: unknown) => boolean): Result {
    try {
        return ok({ value: cb() });
    } catch (caught) {
        if (test?.(caught)) return err({ caught });
        throw caught;
    }
}

/**
 * An enum to be used by taken by consumer functions, to allow callers to
 * handle the result themselves, or allow the function to handle error cases.
 */
export const enum Strategy {
    /** Receive the result and handle it */
    Return = "Return",
    /** Handle any errors and return the OK result */
    Handle = "Handle",
}
