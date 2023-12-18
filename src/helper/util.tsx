
import { Accessor, Context, EffectFunction, JSX, Owner, Ref, Resource, createContext, createEffect, createMemo, createResource, getOwner, on, runWithOwner, splitProps, untrack } from "solid-js";
import { useContext } from "solid-js";

//#region CALL

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
 * Executes a {@link Ref}.
 * Throws a {@link ReferenceError} if {@link ref} its not a function at runtime (Which should never be the case thanks to the solid compiler)
 * @param ref The function to execute
 * @param value The value to pass to the function
 * @returns The same value of {@link value}
 */
export function refCall<T, U extends T = T>(ref: Ref<T> | undefined, value: U): U {
    if (!ref) return value;
    if (typeof ref !== "function") throw new ReferenceError('Il parametro "ref" deve essere stato compilato in una funzione a runtime');
    (ref as any)(value);
    return value;
}

//#endregion

//#region PROPS

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

//#endregion

//#region CONTEXT

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
 * Executes {@link f} with the provided value for the specified {@link Context}.
 * You can pass `undefined` to {@link value} in order to get back the default value for {@link ctx}
 * @param ctx The context to which to set the value
 * @param value The value for the context
 * @param f The function to run
 * @returns The same thing {@link f} returned
 */
export function runWithContext<T, R>(ctx: Context<T>, value: T | undefined, f: (x: T | undefined) => R) {
    const owner = getOwner();
    const context = { ...owner?.context, [ctx.id]: value };
	const temp: Owner = { context, owner, owned: null, cleanups: null };
    return runWithOwner(temp, () => f(value)) as R;
}

//#endregion

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