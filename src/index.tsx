
import { createMemo, splitProps } from "solid-js";

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