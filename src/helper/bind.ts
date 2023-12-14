
import { Accessor, Setter, Signal, createEffect, createRoot, on, onCleanup, untrack } from "solid-js";

/** Conversion function that does nothing */
const IDENTITY = (x: any) => x;

/** Conversion function for bindings */
export type Convert<S, D> = (x: S, prev: D) => D;

/**
 * Creates a one-way binding between two {@link Signal}s
 * @param source The source of the binding
 * @param dest The destination of the binding
 * @param to Conversion function from {@link S} to {@link D}
 * @returns A function that disposes the binding
 */
export function bind<S>(source: Signal<S>, dest: Signal<S>): () => void;
export function bind<S, D>(source: Signal<S>, dest: Signal<D>, to: Convert<S, D>): () => void;
export function bind<S, D>(source: Signal<S>, dest: Signal<D>, to: Convert<S, D> = IDENTITY) {
    const d = createRoot(d => (createEffect(on(source[0], x => dest[1](prev => to(x, prev)))), d));
    return onCleanup(d), d;
}

/**
 * Creates a two-way binding between two {@link Signal}s
 * @param source The source of the binding
 * @param dest The destination of the binding
 * @param to Conversion function from {@link S} to {@link D}
 * @param from Conversion function from {@link D} to {@link S}
 * @returns A function that disposes the binding
 */
export function bindTwoWay<S>(source: Signal<S>, dest: Signal<S>): () => void;
export function bindTwoWay<S, D>(source: Signal<S>, dest: Signal<D>, to: Convert<S, D>, from: Convert<D, S>): () => void;
export function bindTwoWay<S, D>(source: Signal<S>, dest: Signal<D>, to: Convert<S, D> = IDENTITY, from: Convert<D, S> = IDENTITY) {
    const a = bind(source, dest, to);   // dest = source
    const b = bind(dest, source, from); // source = dest (source)
    return () => (a(), b());
}

/**
 * Creates a full-fledged solid {@link Setter} from a normal one
 * @param get The getter of the {@link Signal}; It's needed when a function gets passed to the new setter
 * @param set The simple setter to which to add functionalities
 */
export function toSetter<T>(get: Accessor<T>, set: (x: T) => void): Setter<T> {
    return (x?) => {
        const out = typeof x === "function" ? (x as any)(untrack(get)) : x;
        return set(out), out;
    };
}

/**
 * Creates a {@link Signal} from a property access
 * @param obj The object from which to get the property
 * @param k The key of the property
 */
export function toSignal<T, K extends keyof T>(obj: T, k: K): Signal<T[K]> {
    const get = () => obj[k];
    return [ get, toSetter(get, v => obj[k] = v) ];
}

/**
 * Calls {@link f} maintaining its reactivity
 * @param f An {@link Accessor} to a {@link Signal}
 */
export function unwrapSignal<T>(f: Accessor<Signal<T>>): Signal<T> {
    return [ () => f()[0](), (x?) => f()[1](x!) ];
}