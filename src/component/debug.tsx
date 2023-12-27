
import { Accessor, JSX, Owner } from "solid-js";
import { ReactiveContext } from "./reactiveCtx";

/** Context for the {@link Debug} component */
const ctx = ReactiveContext.create(false, "debug-scope");

/** Creates a scope for the value of {@link Debug.isDebug}, which allows you to display different things in debug mode */
export function Debug(props: { value?: boolean, children?: JSX.Element }) {
    return <ctx.Provider value={props.value ?? true} children={props.children} />
}

/** Internals of {@link Debug} */
export namespace Debug {
    /** Returns an {@link Accessor} that tells whether the current {@link Owner} is in debug mode */
    export declare const isDebug: Accessor<boolean>;

    /** Definition of {@link isDebug} */
    Object.defineProperty(Debug, "isDebug" satisfies keyof typeof Debug, { get: () => ctx.read });
}