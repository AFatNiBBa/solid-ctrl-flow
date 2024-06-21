
import { Context, MemoOptions, createMemo, createRoot, getOwner, splitProps, untrack } from "solid-js";

/** Handy type alias */
type Equals = MemoOptions<unknown>["equals"];

/**
 * Memoizes some of the properties of {@link obj}.
 * If {@link keys} is not provided, memoizes everything that get returned by {@link Object.keys} when provided with {@link obj}.
 * The {@link equals} parameter defaults to `false` to allow the specific reactive value to have control over when its dependant effects are triggered
 * @param obj Object to partially memoize
 * @param keys The keys of the properties to memoize
 * @param equals The comparator function to use on the newly created memos
 */
export function memoProps<T>(obj: T, keys?: undefined, equals?: Equals): T;
export function memoProps<T, K extends readonly (keyof T)[]>(obj: T, keys: K, equals?: Equals): Pick<T, K[number]>;
export function memoProps(obj: any, keys: PropertyKey[] = Object.keys(obj), equals: Equals = false) {
    const out = {};
    for (const elm of keys)
        Object.defineProperty(out, elm, { enumerable: true, get: createMemo(() => obj[elm], undefined, { equals }) });
    return out;
}

/**
 * Executes {@link splitProps} and memoizes the first of the two returned objects using {@link memoProps}.
 * Unlike {@link splitProps}, this doesn't support multiple key-sets out of the box
 * @param obj Object to split and partially memoize
 * @param keys The keys of the properties to memoize and to include in the first of the two objects
 * @param equals The comparator function to use on the newly created memos
 */
export function splitAndMemoProps<T extends Record<any, any>, K extends readonly (keyof T)[]>(obj: T, keys: K, equals?: Equals) {
    const out = splitProps(obj, keys);
    out[0] = memoProps(out[0], keys, equals);
    return out;
}

/**
 * Executes {@link f} untracking it.
 * Due to the fact that the function is passed as input, it does not untrack its changes (It's intentional)
 * @param this The same thing that {@link f} wants as `this`
 * @param f The function to call
 * @param args Arguments for calling {@link f}
 * @returns The same thing {@link f} returned
 */
export function untrackCall<F extends (...args: any[]) => unknown>(this: ThisParameterType<F>, f: F, ...args: Parameters<F>) {
    return untrack(() => f.apply(this, args) as ReturnType<F>);
}

/**
 * Executes {@link f} with the provided value for the specified {@link Context}.
 * You can pass `undefined` to {@link value} in order to get back the default value for {@link ctx}.
 * Everything that happens {@link f} will be disposed as soon as the execution ends
 * @param ctx The context to which to set the value
 * @param value The value for the context
 * @param f The function to run
 * @returns The same thing {@link f} returned
 */
export function runWithContext<T, V extends T, R>(ctx: Context<T>, value: V | undefined, f: (x: V) => R) {
	return createRoot(d => {
        try
        {
            (getOwner()!.context ??= {})[ctx.id] = value;
            return f(value === undefined ? ctx.defaultValue as V : value);
        }
        finally { d(); }
    });
}