
import { Accessor, JSX, ParentProps, Show, createMemo } from "solid-js";
import { untrackCall } from "../helper/util";
import { unwrap } from "../helper/unwrap";

/** Type of an element wrapping call-back which accepts an additional parameter */
type Template<T> = (c: Accessor<JSX.Element>, x: T) => JSX.Element;

/** Standard parameters to pass to an {@link Enfold} */
type Standard<T> = ParentProps<{ when: T, recycled?: boolean }>;

/** Parameters to pass to a keyed {@link Enfold} */
type Keyed<T> = Standard<T> & { keyed: true, template: Template<NonNullable<T>> };

/** Parameters to pass to an unkeyed {@link Enfold} */
type Unkeyed<T> = Standard<T> & { keyed?: false, template: Template<Accessor<NonNullable<T>>> };

/**
 * Eventually wraps its content into a template if a certain condition is met.
 * If you set {@link Standard.recycled} to `true`, the content will be memoized in the beginning and will be recycled even if the wrapper changes.
 * You can't use memoization if you want to use a context provider on your template.
 * If {@link Keyed.keyed} is active, the template will be executed each time the content of {@link Standard.when} changes.
 * If {@link Standard.recycled} is not active, the content will be executed each time it is mounted (Each time {@link Standard.when} goes from a falsish value to a truish one and vice versa).
 * If {@link Keyed.keyed} is active and {@link Standard.recycled} isn't, the content will be executed each time {@link Standard.when} changes
 */
export function Enfold<T>(props: Keyed<T>): JSX.Element;
export function Enfold<T>(props: Unkeyed<T>): JSX.Element;
export function Enfold<T>(props: Keyed<T> | Unkeyed<T>) {
    const f = () => props.children;
    const children = unwrap(createMemo(() => props.recycled ? createMemo(f) : f));
    return <>
        <Show keyed={props.keyed as any} when={props.when} fallback={children()}>
            {x => <>{untrackCall(props.template, children, x)}</>}
        </Show>
    </>
}