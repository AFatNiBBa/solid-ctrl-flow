
import { Accessor, JSX, createContext, useContext } from "solid-js";

/** Context for debug scopes that contains a memoized {@link Accessor} to the value */
const ctx = createContext<Accessor<boolean>>(() => false, { name: "debug-scope" });

/** Sets the value that will be returned by {@link Debug.isDebug} for the children of the current component */
export function Debug(props: { value?: boolean, children: JSX.Element }) {
    return <ctx.Provider value={() => props.value ?? true} children={props.children} />
}

/** Utility functions for the debug scopes */
export namespace Debug {

    /** Gets an {@link Accessor} that tells if the context in which THIS getter has been executed is in debug mode */
    export declare const isDebug: Accessor<boolean>;

    Object.defineProperty(Debug, "isDebug", { get: () => useContext(ctx) });
}