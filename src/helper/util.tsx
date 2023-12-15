
import { Accessor, Context, EffectFunction, JSX, Resource, createContext, createEffect, createMemo, createResource, createRoot, getOwner, on, splitProps, untrack } from "solid-js";
import { useContext } from "solid-js";

/**
 * Executes {@link f} untracking it.
 * Due to the fact that the function is passed as input, it does not untrack its changes (It's intentional)
 * @param this The same thing that {@link f} wants as `this`
 * @param f The function to call
 * @param args Arguments for calling {@link f}
 * @returns The same thing {@link f} returned
 */
export function untrackCall<F extends (...args: any[]) => any>(this: ThisParameterType<F>, f: F, ...args: Parameters<F>) {
    return untrack(() => f.apply(this, args) as ReturnType<F>);
}

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
 * Executes {@link splitProps} and memoizes the first of the two returned objects
 * @param obj Object to split and partially memoize
 * @param keys The keys of the properties to memoize and to include in the first of the two objects
 */
export function splitAndMemoProps<T extends object, K extends readonly (keyof T)[]>(obj: T, keys: K) {
    const out = splitProps(obj, keys);
    out[0] = memoProps(out[0], keys);
    return out;
}

/**
 * Creates a {@link Resource} from the function {@link f}.
 * The resource will be refetched each time one of the dependencies of {@link f} changes
 * @param f A reactive resource fetcher
 */
export function createReactiveResource<R>(f: EffectFunction<R | undefined, R>) {
    var refetch: () => void;
    const memo = createMemo(f);
    createEffect(on(memo, () => refetch?.()));
    const [ get ] = [ , { refetch } ] = createResource(memo);
    return get as Resource<Awaited<R>>;
}

/**
 * Creates a context with a reactive value.
 * Returns a provider with additional fields:
 * - The `read` getter, which returns an {@link Accessor} to the value
 * - The `runWith()` method, which executes {@link runWithContext} on the option
 * @param init Initial value for the context
 * @param def Default value to set when calling the provider without one
 * @param name Name to give to the context
 */
export function createOption<T>(init: T, def = init, name?: string) {
    const prop = "read";
    const ctx = createContext(() => init, { name });
    const provider = (props: { value?: T, children: JSX.Element }) => <ctx.Provider value={() => props.value ?? def} children={props.children} />;
    Object.defineProperty(provider, prop, { get: () => useContext(ctx) });

    /** Executes {@link runWithContext} on the provided option */
    provider.runWith = <V extends T, R>(x: V, f: (x: V) => R) => runWithContext(ctx, () => x, () => f(x));

    return provider as typeof provider & {
        /** Returns the {@link Accessor} for the value in the current context */
        [prop]: Accessor<T>
    };
}

/**
 * Executes {@link f} with the provided {@link Context}
 * @param ctx The context to which to set the value
 * @param value The value for the context
 * @param f The function to run
 * @returns The same thing {@link f} returned
 */
export function runWithContext<T, R>(ctx: Context<T>, value: T, f: (x: T) => R) {
	return createRoot(d => {
		try
        {
            getOwner()!.context = { [ctx.id]: value };
            const out = f(value);
            if (out instanceof Promise)
                return out.finally(d) as R;
            return d(), out;
        }
		catch (ex) { throw d(), ex; }
	});
}