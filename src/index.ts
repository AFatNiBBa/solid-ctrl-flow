
import { Context, createMemo, createRoot, getOwner, splitProps, untrack } from "solid-js";

export * from "./component/case";
export * from "./component/debug";
export * from "./component/extractor";

/**
 * Memoizes some of the properties of {@link obj}
 * If {@link keys} is not provided, memoizes everything that get returned by {@link Object.keys} when provided with {@link obj}
 * @param obj Object to partially memoize
 * @param keys The keys of the properties to memoize
 */
export function memoProps<T, K extends readonly (keyof T)[] = (keyof T)[]>(obj: T, keys: K = Object.keys(obj!) as unknown as K) {
    const out = {};
    for (const elm of keys)
        Object.defineProperty(out, elm, { enumerable: true, get: createMemo(() => obj[elm]) });
    return out as Pick<T, K[number]>;
}

/**
 * Esecutes {@link splitProps} and memoizes the first of the two returned objects
 * @param obj Object to split and partially memoize
 * @param keys The keys of the properties to memoize and to include in the first of the two objects
 */
export function splitAndMemoProps<T extends object, K extends readonly (keyof T)[]>(obj: T, keys: K) {
    const [ mine, other ] = splitProps(obj, keys);
    return [ memoProps(mine, keys), other ] as const;
}

/**
 * Executes {@link f} with the provided {@link Context}
 * @param ctx The context to which to set the value
 * @param value The value for the context
 * @param f The function to run
 * @returns The same thing {@link f} returned
 */
export function runWithContext<T, R>(ctx: Context<T>, value: T, f: (x: T) => R) {
	return createRoot(async d => {
		try
        {
            getOwner()!.context = { [ctx.id]: value };
            const out = f(value);
            if (out instanceof Promise)
                return <R>out.finally(d);
            return d(), out;
        }
		catch (ex) { throw d(), ex; }
	});
}

/**
 * Executes {@link f} untracking it.
 * Due to the fact that the function is passed as input, it does not untrack its changes (It's intentional)
 * @param this The same thing that {@link f} wants as `this`
 * @param f The function to call
 * @param args Arguments for calling {@link f}
 * @returns The same thing {@link f} returned
 */
export function untrackCall<F extends (...args: any[]) => any>(this: ThisParameterType<F>, f: F, ...args: Parameters<F>) {
    return untrack(() => f.apply(this, args));
}