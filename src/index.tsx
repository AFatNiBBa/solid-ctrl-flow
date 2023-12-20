
import { JSX, Show, Suspense } from "solid-js";
import { createOption } from "./helper/util";

export * from "./helper/bind";
export * from "./helper/util";
export * from "./component/case";
export * from "./component/extractor";

/** Creates a scope for the value of {@link Debug.read}, which allows you to display different things in debug mode */
export const Debug = createOption(false, true, "debug-scope");

/** Like a {@link Suspence}, but enables you to turn it off and show the loading state */
export function OptionalSuspense(props: { active: boolean, children: JSX.Element, fallback?: JSX.Element }) {
    return <>
        <Show when={props.active} fallback={props.children}>
            <Suspense fallback={props.fallback}>
                {props.children}
            </Suspense>
        </Show>
    </>
}