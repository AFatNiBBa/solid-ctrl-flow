
import { Accessor, Setter, Signal, createRenderEffect, createRoot, on, onCleanup, untrack } from "solid-js";

/** Conversion function that does nothing */
const IDENTITY = (x: any) => x;

/** Conversion function for bindings */
export type Convert<S, D> = (x: S, prev: D) => D;

/**
 * Creates a one-way binding between two {@link Signal}s.
 * The function uses {@link createRenderEffect}, which means that:
 * - As soon as the function is done executing the two {@link Signal}s will have the same value
 * - If {@link source} changes, {@link dest} wont be instantly updated
 * - If the current owner gets disposed before {@link dest} is updated, it never will
 * @param source The getter of the source of the binding
 * @param dest The setter of the destination of the binding
 * @param to Conversion function from {@link S} to {@link D}
 * @returns A function that disposes the binding
 */
export function bind<S>(source: Accessor<S>, dest: Setter<S>): () => void;
export function bind<S, D>(source: Accessor<S>, dest: Setter<D>, to: Convert<S, D>): () => void;
export function bind<S, D>(source: Accessor<S>, dest: Setter<D>, to: Convert<S, D> = IDENTITY) {
    const d = createRoot(d => (createRenderEffect(on(source, x => dest(prev => to(x, prev)))), d));
    return onCleanup(d), d;
}

/**
 * Creates a two-way binding between two {@link Signal}s calling {@link bind} two times
 * @param source The source of the binding
 * @param dest The destination of the binding
 * @param to Conversion function from {@link S} to {@link D}
 * @param from Conversion function from {@link D} to {@link S}
 * @returns A function that disposes the binding
 */
export function bindTwoWay<S>(source: Signal<S>, dest: Signal<S>): () => void;
export function bindTwoWay<S, D>(source: Signal<S>, dest: Signal<D>, to: Convert<S, D>, from: Convert<D, S>): () => void;
export function bindTwoWay<S, D>(source: Signal<S>, dest: Signal<D>, to?: Convert<S, D>, from?: Convert<D, S>) {
    const a = bind(source[0], dest[1], to!);   // dest = source
    const b = bind(dest[0], source[1], from!); // source = dest (source)
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
 * @param obj The {@link Accessor} to the object from which to get the property
 * @param k The {@link Accessor} to the key of the property
 */
export function toSignal<T, K extends keyof T>(obj: Accessor<T>, k: Accessor<K>): Signal<T[K]> {
    const get = () => obj()[k()];
    return [ get, toSetter(get, v => obj()[k()] = v) ];
}

/**
 * Returns a {@link Signal} that applies the `??=` operator to the input one.
 * If the getter of {@link param0} is like "x", then the result one is like "(x ??= {@link f}())"
 * @param param0 The {@link Signal} to which to coalesce the getter
 * @param f An {@link Accessor} to the value to use when there's a nullish value
 */
export function coalesceSignal<T>([ get, set ]: Signal<T | undefined>, f: Accessor<T>): Signal<T> {
    return [ () => get() ?? set(f), set as Setter<T> ];
}