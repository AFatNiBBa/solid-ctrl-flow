
import { Switch, Match, ParentProps, createContext, useContext, createSelector, equalFn } from "solid-js";
import { memoProps } from "../index";

/** Context for the {@link On} and {@link Case} components */
const ctx = createContext<(x: unknown) => boolean>(undefined, { name: "on-case" });

/**
 * Allows the use of {@link Case}s inside of {@link Switch}es.
 * Example:
 * ```tsx
 * return <>
 *  <Switch>
 *      <Match when={SOMETHING}>
 *          Random condition
 *      </Match>
 *      <On value={1} onCompare={(a, b) => a == b}>
 *          <Case value="1">
 *              True because the comparator has been overridden
 *          </Case>
 *          <Case value={2}>
 *              False
 *          </Case>
 *      </On>
 *      <Match when>
 *          Default
 *      </Match>
 *  </Switch>
 * </>
 * ```
 */
export function On<T>(props: ParentProps<{ value: T, onCompare?(a: unknown, b: T): boolean }>) {
    const memo = memoProps(props);
    const selector = createSelector<T, unknown>(() => memo.value, (a, b) => (memo.onCompare ?? equalFn)(a, b));
    return <>
        <ctx.Provider value={selector}>
            {props.children}
        </ctx.Provider>
    </>
}

/** Like a {@link Match} but gets the value from the closest {@link On} ancestor */
export function Case(props: ParentProps<{ value: unknown }>) {
    const selector = useContext(ctx)!;
    return <>
        <Match when={selector(props.value)}>
            {props.children}
        </Match>
    </>
}