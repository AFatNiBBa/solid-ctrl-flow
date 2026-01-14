
import { Context, createRoot, getOwner, onCleanup, untrack } from "solid-js";

/** Minimal representation of an event target */
type AbstractEventTarget<K, F> = { addEventListener(k: K, f: F): void, removeEventListener(k: K, f: F): void };

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
 * Adds the {@link f} event listener to the {@link k} event of the {@link obj} emitter and removes it when the current reactive context is disposed
 * @param obj The emitter to which to add the event listener
 * @param k The key of the event for which to add the listener
 * @param f The function to call when the event is emitted
 */
export function registerEventListener<K extends keyof HTMLElementEventMap>(obj: HTMLElement, type: K, listener: (this: HTMLElement, e: HTMLElementEventMap[K]) => any): void;
export function registerEventListener<K, F>(obj: AbstractEventTarget<K, F>, k: K, f: F): void;
export function registerEventListener<K, F>(obj: AbstractEventTarget<K, F>, k: K, f: F) {
    obj.addEventListener(k, f);
    onCleanup(() => obj.removeEventListener(k, f));
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