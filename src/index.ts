
import { Context, JSX, Owner, ParentProps, createMemo, getOwner } from "solid-js";
import { ReactiveContext } from "./helper/context";

export * from "./component/enfold";
export * from "./component/extractor";
export * from "./component/nest";
export * from "./component/switch";
export * from "./helper/bind";
export * from "./helper/context";
export * from "./helper/slot";
export * from "./helper/unwrap";
export * from "./helper/util";

/** Built-in {@link ReactiveContext} which allows you to display different things in debug mode */
export const debug = ReactiveContext.create(false, "debug-scope");

/** Makes its children inherit the {@link Context}s of the provided {@link Owner} */
export function SameContext(props: ParentProps<{ owner: Owner }>) {
    return createMemo(() => {
        getOwner()!.context = props.owner.context;
        return props.children;
    }) as unknown as JSX.Element;
}