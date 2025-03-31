
import { Accessor, createMemo, getOwner, MemoOptions, Owner, runWithOwner, splitProps } from "solid-js";

/** Handy type alias */
type Equals = MemoOptions<unknown>["equals"];

/**
 * Memoizes the properties of {@link obj}.
 * The {@link equals} parameter defaults to `false` to allow the specific reactive value to have control over when its dependant effects are triggered
 * @param obj The object to memoize
 * @param equals The comparator function to use on the newly created memos
 */
export const memoProps = <T extends object>(obj: T, equals?: Equals) => new Proxy(obj, new MemoPropsHandler(getOwner()!, equals));

/**
 * Executes {@link splitProps} and memoizes every returned object but the last one using {@link memoProps}
 * @param obj Object to split and partially memoize
 * @param keys The lists of the keys to split from {@link obj}
 */
export const splitAndMemoProps: typeof splitProps = (obj, ...keys) => {
    const out = splitProps(obj, ...keys);
    for (var i = 0; i < keys.length; i++)
        out[i] = memoProps(out[i], keys[i] as any) as any;
    return out;
};

/** Handler of the {@link Proxy} created by {@link memoProps} */
class MemoPropsHandler<T extends object> implements ProxyHandler<T> {
    cache: { -readonly [k in keyof T]?: Accessor<T[k]> } = Object.create(null);

    constructor(public owner: Owner, public equals: Equals = false) { }

    /**
     * -
     * Memoizes each property that gets read
     * @inheritdoc
     */
    get(t: T, k: string | symbol) {
        const temp = k as keyof T;
        const cache = this.cache[temp] ??= this.memoize(t, temp);
        return cache();
    }

    /**
     * Memoizes a property of an object
     * @param t The object containing the property
     * @param k The key of the property
     */
    memoize(t: T, k: keyof T) {
        const name = `${memoProps.name}(${k.toString()})`;
        const opts: MemoOptions<T[keyof T]> = { name, equals: this.equals };
        return runWithOwner(this.owner, () => createMemo(() => t[k], undefined, opts))!;
    }
}