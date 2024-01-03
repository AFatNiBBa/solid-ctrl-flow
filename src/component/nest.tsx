
import { Accessor, For, JSX, createSignal, mapArray, onCleanup, onMount } from "solid-js";
import { memoProps } from "..";

/**
 * Like a {@link For}, but instead of putting an element after another it nests them.
 * The component will try to recycle the layers when the source array changes (Once again, like the {@link For}).
 * Due to the recyling, the layers will be created indipendently, thus their {@link Owner}s won't be nested in their parents' ones.
 * Example:
 * ```tsx
 * return <>
 * 	<Nest each={[ 1, 2, 3 ]} template={(x, y) => <>({x}, {y()}, -{x})</>}>
 * 		content
 * 	</Nest>
 * </>
 * ```
 * Will output "(1, (2, (3, content, -3), -2), -1)"
 */
export function Nest<T>(props: { each: T[], template: (x: T, c: Accessor<JSX.Element>, i: Accessor<number>) => JSX.Element, children: JSX.Element }) {
	const memo = memoProps(props, [ "template", "children" ]);
	const content = mapArray(() => props.each, (x, i) => {
		const [ get, set ] = createSignal<JSX.Element>();
		const out = memo.template(x, get, i);
		return (x: JSX.Element) => {
			onMount(() => set(() => x)); // It doesn't get executed immediately because it needs to wait for the effect that will remove the previous element to run
			onCleanup(() => set(undefined));
			return out;
		};
	});
	return <>{content().reduceRight((a, b) => b(a), memo.children)}</>
}