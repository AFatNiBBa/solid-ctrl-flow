
import { Accessor, Context, Owner, ParentProps, createContext, createMemo, createRoot, getOwner, useContext } from "solid-js";

/** Type hack for making {@link ReactiveContext} implement {@link Accessor} */
const BASE_CTOR = Function as unknown as new<T>() => Accessor<T>;

/**
 * Reactive {@link Context} with some additional built-in functionalities.
 * The call signature returns the value in the current {@link Owner} (It's like calling {@link get})
 */
export abstract class ReactiveContext<T> extends BASE_CTOR<T> {
    /** The actual {@link Context} that contains the reactive {@link Accessor} to the value */
    abstract ctx: Context<Accessor<T>>;

    /**
     * Returns the {@link Accessor} for the value in the current {@link Owner}.
     * It's like calling {@link useContext}
     */
    get get() { return useContext(this.ctx); }

    /**
     * Component that sets the value of the current {@link Context} for its children.
     * If no value is provided then it will use the default value for {@link ctx}.
     * The function is bound for the way solid compiles components inside other objects.
     * (The value is memoized)
     */
    get Provider() {
        const { ctx } = this;
        return function (props: ParentProps<{ value?: T }>) {
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
    runWith<V extends T, R>(value: V | undefined, f: (x: V) => R): R {
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
        const f = () => out.get();
        f.ctx = ctx;
        const out = Object.setPrototypeOf(f, ReactiveContext.prototype) as ReactiveContext<T>;
        return out;
    }
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