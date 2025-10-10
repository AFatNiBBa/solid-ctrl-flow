
import { Context, JSX, Owner, ParentProps, createMemo, createRenderEffect, getOwner, on, splitProps } from "solid-js";
import { spread } from "solid-js/web";

export * from "./component/enfold";
export * from "./component/extractor";
export * from "./component/switch";
export * from "./helper/memo";
export * from "./helper/orderedLinkedList";
export * from "./helper/unwrap";
export * from "./helper/util";

/** Makes its children inherit the {@link Context}s of the provided {@link Owner} */
export function SameContext(props: ParentProps<{ owner: Owner }>) {
    return createMemo(() => {
        getOwner()!.context = props.owner.context;
        return props.children;
    }) as unknown as JSX.Element;
}

/**
 * Fake component that executes {@link spread} on the element.
 * It's used to split the properties in multiple calls to {@link spread} to allow duplicates on things that accept them (Like the "on:..." events).
 * It's recommended to NOT pass properties that don't accept duplicates
 */
export function Spread<T extends Element>(props: { target: T } & JSX.HTMLAttributes<T>) {
    const [ mine, other ] = splitProps(props, [ "target" ]);
    createRenderEffect(on(() => mine.target, x => spread(x, other)));
    return undefined; // Returns to make TypeScript understand that this is a component
}