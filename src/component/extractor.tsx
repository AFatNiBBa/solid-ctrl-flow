
import { Context, JSX, Show, createContext, createMemo, onCleanup, useContext } from "solid-js";
import { createMutable } from "solid-js/store";

/** Type of the data stored in each context created by {@link createExtractor} */
type Store = { attached: number, source?: JSX.Element };

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
        get isExtracted() {
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
    return <>{obj.source}</>;
}

/** Puts its content inside of a {@link Dest} if it is available */
function Source(this: Context<Store | undefined>, props: { children: JSX.Element }) {
    const obj = useContext(this);
    if (!obj) return props.children;
    if (obj.source) throw new Error("An extractor can't have more than one source");
    const memo = createMemo(() => props.children);
    obj.source = <>{memo()}</>;
    onCleanup(() => obj.source = undefined);
    return <Show when={!obj.attached} children={memo()} />
}

/** Allows {@link Dest} and {@link Source} childrens to communicate with each other  */
function Joint(this: Context<Store | undefined>, props: { children: JSX.Element }) {
    const { Provider } = this;
    const obj = createMutable<Store>({ attached: 0 });
    return <Provider value={obj} children={props.children} />
}