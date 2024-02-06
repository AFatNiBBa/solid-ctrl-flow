
import { Switch, Match, JSX, Accessor, ComponentProps, Show } from "solid-js";
import { ReactiveContext } from "../helper/context";
import { splitAndMemoProps } from "../index";
import { Without } from "logic-types";

/** Context for the {@link Case} and {@link When} components */
const ctx = ReactiveContext.create(undefined, "case-when");

/**
 * Allows the use of {@link When}s inside of {@link Switch}es.
 * Example:
 * ```tsx
 * return <>
 *  <Switch>
 *      <Match when={SOMETHING}>
 *          RANDOM_CONDITION
 *      </Match>
 *      <Case value={1}>
 *          <When value={1}>
 *              TRUE
 *          </When>
 *          <When pred={x => x === 2}>
 *              FALSE_WITH_PREDICATE
 *          </When>
 *          <When pred={x => x.innerValue}>
 *              {x => <>THRUTHY VALUE {x()}</>}
 *          </When>
 *          <When keyed pred={x => x.innerValue}>
 *              {x => <>THRUTHY KEYED VALUE {x}</>}
 *          </When>
 *      </Case>
 *      <Match when>
 *          DEFAULT
 *      </Match>
 *  </Switch>
 * <>
 * ```
 */
export const Case: (props: { value: any, children: JSX.Element }) => JSX.Element = ctx.Provider;

/** Like a {@link Match} but gets the value from the closest {@link Case} ancestor */
export function When(props: { value: unknown, children: JSX.Element }): JSX.Element;

export function When(props: { pred: (x: any) => unknown, children: JSX.Element }): JSX.Element;

export function When<T>(props: { pred: (x: any) => T, keyed?: false, children: (x: Accessor<NonNullable<T>>) => JSX.Element }): JSX.Element;

export function When<T>(props: { pred: (x: any) => T, keyed: true, children: (x: NonNullable<T>) => JSX.Element }): JSX.Element;

export function When<T>(props: { value?: unknown, pred?: (x: any) => T }) {
    const [ mine, other ] = splitAndMemoProps(props, [ "value", "pred" ]);
    const { read } = ctx;
    const pred = (x: unknown) => mine.pred ? mine.pred(x) : x === mine.value;
    return <Match when={pred(read())} {...other as any} />
}

/**
 * It works like a `Show`, but for `Switch`es, you can wrap `Match`es with it in order to not trigger them in certain conditions.
 * It doesn't support the `fallback` attribute.
 * Example:
 * ```tsx
 * const value = false;
 * return <>
 *  <Switch>
 *      <Match when={false}>
 *          FALSE
 *      </Match>
 *      <Ensure when={false}>
 *          <Match when>
 *              This won't render because "value" is {false}
 *          </Match>
 *      </Ensure>
 *      <Match when>
 *          (This will render)
 *      </Match>
 *  </Switch>
 * <>
 * ```
 */
export function Ensure(props: Without<ComponentProps<typeof Show>, "fallback">) {
    return <Show {...props} fallback={<Match when={false} children={undefined} />} />
}