
import { Accessor, Setter, Signal, createRenderEffect, createRoot, createSignal, getListener, on, onCleanup, untrack } from "solid-js";
import { unwrap } from "./unwrap";

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
 * @param skip If it is `true`, {@link dest} won't be executed until the next change
 * @returns A function that disposes the binding
 */
export function bind<S>(source: Accessor<S>, dest: Setter<S>, to?: undefined, skip?: boolean): () => void;
export function bind<S, D>(source: Accessor<S>, dest: Setter<D>, to: Convert<S, D>, skip?: boolean): () => void;
export function bind<S, D>(source: Accessor<S>, dest: Setter<D>, to: Convert<S, D> = IDENTITY, skip = false) {
    const d = createRoot(d => (createRenderEffect(on(source, x => skip ? skip = false : dest(prev => to(x, prev)))), d));
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
    const a = bind(source[0], dest[1], to!);
    const b = bind(dest[0], source[1], from!, true);
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
 * Calls {@link f} maintaining its reactivity at 2 levels.
 * Unlike the normal {@link unwrap}, this maintains reactivity on the elements of the array too, which means that it can be destructured
 * ```ts
 * const first = unwrap(f);         // The value of `first` is reactive but CANNOT be destructured
 * const [ getFirst ] = first;      // The value of `getFirst()` is NOT reactive, it's the first element of the CURRENT signal returned by `f()`
 * 
 * const second = unwrapSignal(f);  // The value of `second` is reactive and CAN be destructured
 * const [ getSecond ] = second;    // The value of `getSecond()` IS reactive, it's a function that calls `f()`, gets the first element and calls that too
 * ```
 * @param f An {@link Accessor} to a {@link Signal}
 */
export function unwrapSignal<T>(f: Accessor<Signal<T>>): Signal<T> {
    return [ () => f()[0](), (x?) => f()[1](x!) ];
}

/**
 * Creates a {@link Signal} that behaves like the input one, with the only difference that each call to the setter will trigger the effects even if the value didn't change.
 * Can give reactivity to a fake {@link Signal}
 * @param param0 The {@link Signal} to force
 */
export function forceSignal<T>([ get, set ]: Signal<T>): Signal<T> {
    const [ track, update ] = createSignal(undefined, { equals: false });
    return [
        () => (track(), get()),
        (x?) => {
            const out = set(x!);
            return update(), out;
        }
    ]
}

/**
 * Returns a {@link Signal} that applies the `??=` operator to the input one.
 * If the getter of {@link param0} is like `x`, then the result one is like "(x ??= {@link f}())"
 * @param param0 The {@link Signal} to which to coalesce the getter
 * @param f An {@link Accessor} to the value to use when there's a nullish value
 */
export function coalesceSignal<T>([ get, set ]: Signal<T | undefined>, f: Accessor<T>): Signal<T> {
    return [ getter, set as Setter<T> ];

    /** Ensures that the current effect doesn't get executed twice because of the coalescing */
    function getter() {
        const out = get();
        if (out != null) return out;
        const listener = getListener()!, { state } = listener;
        try { return set(f); } // This would cause the current effect to run again
        finally { listener.state = state; }
    }
}