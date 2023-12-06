
import { Context, For, JSX, Show, createContext, createMemo, onCleanup, useContext } from "solid-js";
import { createMutable } from "solid-js/store";

/** Type of the data stored in each context created by {@link createExtractor} */
type Store = { attached: number, source: Info[] };

/** Informations about a {@link Source} component */
type Info = {
    /** Order of the current source if there are many */
    order?: number,
    children: JSX.Element
};

/**
 * Creates a slot that allows you to show a component outside of its parent.
 * It works with arbitrary nesting.
 * Example:
 * ```tsx
 * const e = createExtractor();
 * return <>
 *  <e.Joint>
 *      <div id="something">
 *          <e.Dest />
 *      </div>
 *      <div id="something-else">
 *          <e.Source>
 *              This text will be shown instead of "e.Dest".
 *              If there weren't to be any "e.Joint" ancestor, then this text would have stayed here
 *          </e.Source>
 *      </div>
 *  </e.Joint>
 * <>
 * ```
 * @param name Name to give to the context of the extractor
 */
export function createExtractor(name = "extractor") {
    const ctx = createContext<Store>(undefined, { name });
    return {
        /** Bound {@link Dest} */
        Dest: Dest.bind(ctx),

        /** Bound {@link Source} */
        Source: Source.bind(ctx),

        /** Bound {@link Joint} */
        Joint: Joint.bind(ctx),

        /**
         * Gets an {@link Accessor} that tells if the context in which THIS getter has been executed has been extracted (Is inside of a {@link Dest})
         * @returns Returns `null` if there is no parent {@link Joint}, the number of {@link Dest}s in which this component is being displayed otherwise (Usually 1)
         */
        get extracting() {
            const obj = useContext(ctx);
            return () => obj?.attached ?? null;
        }
    }
}

/** Shows the content of the closest {@link Source} child of the closest {@link Joint} ancestor of this component */
function Dest(this: Context<Store | undefined>) {
    const obj = useContext(this);
    if (!obj) return;
    obj.attached++;
    onCleanup(() => obj.attached--);
    return <>
        <For each={obj.source.sort((a, b) => a.order! - b.order!)}>
            {x => <>{x.children}</>}
        </For>
    </>
}

/** Puts its content inside of a {@link Dest} if it is available; There is no need to include this component on the DOM tree */
function Source(this: Context<Store | undefined>, props: Info) {
    const obj = useContext(this);
    if (!obj) return props.children;
    const order = createMemo(() => props.order || 0);
    const info = { get order() { return order(); }, get children() { return props.children; } } satisfies Info; // Memoizes only "order"
    obj.source.push(info);
    onCleanup(() => obj.source.splice(obj.source.indexOf(info), 1));
    return <Show when={!obj.attached} children={info.children} />
}

/** Allows {@link Dest} and {@link Source} childrens to communicate with each other  */
function Joint(this: Context<Store | undefined>, props: { children: JSX.Element }) {
    const { Provider } = this;
    const obj = createMutable<Store>({ attached: 0, source: [] });
    return <Provider value={obj} children={props.children} />
}