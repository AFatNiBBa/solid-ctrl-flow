
import { Context, JSX, Owner, ParentProps, createMemo, getOwner } from "solid-js";

export * from "./component/enfold";
export * from "./component/extractor";
export * from "./component/switch";
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