
import { Accessor, Setter } from "solid-js";

/**
 * Calls an {@link Accessor} maintaining its reactivity at 1 level.
 * The `typeof` operator on the output returns `"function"`, so you have to wrap it if you use it in, for example, in a {@link Setter} and you don't want it to be invoked
 * @param f The {@link Accessor} to the value to emulate
 * @returns A {@link Proxy} that copies the functionalities of the result of {@link f} calling it for each interaction, thus maintaining reactivity
 */
export const unwrap = <T extends object>(f: Accessor<T>) => <T>new Proxy(f, HANDLER);

/**
 * The handler of the {@link Proxy} returned by {@link unwrap}.
 * It's a proxy that for each {@link Reflect} key returns a function that calls the original value after executing the first parameter (The target)
 */
const HANDLER: ProxyHandler<Accessor<unknown>> = new Proxy(<any>{}, {
    get(cache, k) {
        return cache[k] ??= (t: Accessor<unknown>, ...args: unknown[]) => {
            return (Reflect[k as keyof typeof Reflect] as Function)(t(), ...args);
        };
    }
});