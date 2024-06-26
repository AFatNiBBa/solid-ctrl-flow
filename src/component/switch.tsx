
import { Switch, Match, JSX, Accessor, ParentProps, createContext, useContext } from "solid-js";
import { splitAndMemoProps } from "../index";

/** Context for the {@link On} and {@link Case} components */
const ctx = createContext<Accessor<any>>(undefined, { name: "on-case" });

/**
 * Allows the use of {@link Case}s inside of {@link Switch}es.
 * Example:
 * ```tsx
 * return <>
 *  <Switch>
 *      <Match when={SOMETHING}>
 *          RANDOM_CONDITION
 *      </Match>
 *      <On value={1}>
 *          <Case value={1}>
 *              TRUE
 *          </Case>
 *          <Case pred={x => x === 2}>
 *              FALSE_WITH_PREDICATE
 *          </Case>
 *          <Case pred={x => x.innerValue}>
 *              {x => <>THRUTHY VALUE {x()}</>}
 *          </Case>
 *          <Case keyed pred={x => x.innerValue}>
 *              {x => <>THRUTHY KEYED VALUE {x}</>}
 *          </Case>
 *      </On>
 *      <Match when>
 *          DEFAULT
 *      </Match>
 *  </Switch>
 * <>
 * ```
 */
export const On = (props: ParentProps<{ value: any }>) => <ctx.Provider value={() => props.value}>{props.children}</ctx.Provider>

/** Like a {@link Match} but gets the value from the closest {@link On} ancestor */
export function Case(props: ParentProps<{ value: unknown }>): JSX.Element;

export function Case(props: ParentProps<{ pred(x: any): unknown }>): JSX.Element;

export function Case<T>(props: { pred(x: any): T, keyed?: false, children(x: Accessor<NonNullable<T>>): JSX.Element }): JSX.Element;

export function Case<T>(props: { pred(x: any): T, keyed: true, children(x: NonNullable<T>): JSX.Element }): JSX.Element;

export function Case<T>(props: { value?: unknown, pred?(x: any): T }) {
    const [ mine, other ] = splitAndMemoProps(props, [ "value", "pred" ]);
    const get = useContext(ctx)!;
    const pred = (x: unknown) => mine.pred ? mine.pred(x) : x === mine.value;
    return <Match when={pred(get())} {...other as any} />
}