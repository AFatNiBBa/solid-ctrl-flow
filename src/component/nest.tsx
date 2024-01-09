
import { Accessor, For, JSX, createSignal, mapArray, onCleanup, onMount } from "solid-js";
import { memoProps, untrackCall } from "../helper/util";

/**
 * Like a {@link For}, but instead of putting an element after another it nests them.
 * The component will try to recycle the layers when the source array changes (Once again, like the {@link For}).
 * Due to the recyling, the layers will be created indipendently, thus their {@link Owner}s won't be nested in their parents' ones, this makes the component unsuitable to wrap the content with context providers.
 * Example:
 * ```tsx
 * return <>
 * 	<Nest each={[ 1, 2, 3 ]} template={(c, x) => <>({x}, {c()}, -{x})</>}>
 * 		content
 * 	</Nest>
 * </>
 * ```
 * Will output "(1, (2, (3, content, -3), -2), -1)"
 */
export function Nest<T>(props: { each: readonly T[] | undefined, template: (c: Accessor<JSX.Element>, x: T, i: Accessor<number>) => JSX.Element, children: JSX.Element }) {
	const memo = memoProps(props, [ "template", "children" ]);
	const content = mapArray(() => props.each, (x, i) => {
		const [ get, set ] = createSignal<JSX.Element>();
		const out = <>{untrackCall(memo.template, get, x, i)}</>;
		return (x: JSX.Element) => {
			onMount(() => set(() => x)); // It doesn't get executed immediately because it needs to wait for the effect that will remove the previous element to run
			onCleanup(() => set(undefined));
			return out;
		};
	});
	return <>{content().reduceRight((a, b) => b(a), memo.children)}</>
}