
import { ComponentProps, Context, For, ParentProps, Show, createContext, createMemo, getOwner, onCleanup, useContext } from "solid-js";
import { createMutable } from "solid-js/store";
import { Slot } from "../helper/slot";
import { SameContext } from "..";

/** Type of the data stored in each context created by {@link createExtractor} */
type Store = { attached: number, source: Info[] };

/** Informations about a {@link Source} component */
type Info = ParentProps<Slot & { order?: number }>;

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
 *              This text will be shown instead of `e.Dest`.
 *              If there weren't to be any `e.Joint` ancestor, then this text would have stayed here
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
        /** Shows the content of the closest {@link Source} child of the closest {@link Joint} ancestor of this component */
        Dest: Dest.bind(ctx),

        /** Puts its content inside of a {@link Dest} if it is available; There is no need to include this component on the DOM tree */
        Source: Source.bind(ctx),

        /** Allows {@link Dest} and {@link Source} childrens to communicate with each other  */
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

/** Unbound destination component */
function Dest(this: Context<Store | undefined>) {
    const obj = useContext(this);
    if (!obj) return;
    obj.attached++;
    onCleanup(() => obj.attached--);
    return <>
        {/* It's important to clone `obj.source` before sorting it, otherwise the indexes of the slots would be fucked up */}
        <For each={obj.source.toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0))}>
            {x => <>{x.children}</>}
        </For>
    </>
}

/** Unbound source component */
function Source(this: Context<Store | undefined>, props: Info & { sameContext?: boolean }) {
    const obj = useContext(this);
    if (!obj) return <>{props.children}</>;
    const info = createInfo(props);
    Slot.push(obj.source, info);
    onCleanup(() => Slot.remove(obj.source, info));
    return <Show when={!obj.attached} children={info.children} />
}

/** Unbound joint component */
function Joint(this: Context<Store | undefined>, props: ParentProps) {
    const { Provider } = this;
    const obj = createMutable<Store>({ attached: 0, source: [] });      // The `source` property is needed to be an array in order to make it mutable
    return <Provider value={obj} children={props.children} />
}

/**
 * Creates an {@link Info} that will be stored inside a {@link Store} from the props passed to a {@link Source}
 * @param props The attributes passed to a {@link Source}
 */
function createInfo(props: ComponentProps<typeof Source>): Info {
    const owner = getOwner()!, memo = createMemo(() => props.order);    // Memoizes only `order`
    return {
        get order() { return memo(); },
        get children() {
            return <>
                <Show when={props.sameContext} fallback={props.children}>
                    <SameContext owner={owner} children={props.children} />
                </Show>
            </>
        }
    };
}