
import { Accessor, Context, JSX, Owner, createContext, createMemo, useContext } from "solid-js";
import { runWithContext } from "..";

/**
 * Reactive {@link Context} with some additional built-in functionalities.
 * The call signature returns the value in the current {@link Owner} (It's like calling {@link read})
 */
export abstract class ReactiveContext<T> extends (Function as unknown as new<T>() => Accessor<T>)<T> {
    /** The actual {@link Context} that contains the reactive {@link Accessor} to the value */
    abstract ctx: Context<Accessor<T>>;

    /**
     * Returns the {@link Accessor} for the value in the current {@link Owner}.
     * It's like calling {@link useContext}
     */
    get read() { return useContext(this.ctx); }

    /**
     * Component that sets the value of the current {@link Context} for its children.
     * If no value is provided then it will use the default value for {@link ctx}.
     * The function is binded for the way solid compiles components inside other objects.
     * (The value is memoized)
     */
    get Provider() {
        const { ctx } = this;
        return function (props: { value?: T, children: JSX.Element }) {
            const memo = createMemo(() => props.value!);
            return <ctx.Provider value={memo} children={props.children} />
        }
    }
    
    /**
     * Executes {@link runWithContext} on the current context
     * @param value The value for the context
     * @param f The function to run
     * @returns The same thing {@link f} returned
     */
    runWith<V extends T, R>(value: V, f: (x: V) => R): R;
    runWith<R>(value: T | undefined, f: (x: T) => R): R;
    runWith<R>(value: T | undefined, f: (x: T) => R): R {
        return runWithContext(this.ctx, value === undefined ? undefined : () => value, x => f(x()));
    }

    /**
     * Creates a {@link ReactiveContext}
     * @param defaultValue Initial value for the context
     * @param name Name to give to the context
     */
    static create<T>(defaultValue?: undefined, name?: string): ReactiveContext<T | undefined>;
    static create<T>(defaultValue: T, name?: string): ReactiveContext<T>;
    static create<T>(defaultValue: T, name?: string) {
        const ctx = createContext(() => defaultValue, { name });
        const f = () => out.read();
        f.ctx = ctx;
        const out = Object.setPrototypeOf(f, ReactiveContext.prototype) as ReactiveContext<T>;
        return out;
    }
}