
import { createOption, refCall } from "./helper/util";
import { Ref, onMount } from "solid-js";

export * from "./helper/bind";
export * from "./helper/util";
export * from "./component/case";
export * from "./component/extractor";

/** Creates a scope for the value of {@link Debug.read}, which allows you to display different things in debug mode */
export const Debug = createOption(false, true, "debug-scope");

/** Component that gives you the owner {@link Document} */
export function Doc(props: { ref: Ref<Document> }) {
    const node = document.createTextNode("");
    onMount(() => (refCall(props.ref, node.ownerDocument), node.remove()));
    return node;
}