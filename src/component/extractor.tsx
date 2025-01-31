
import { Context, createContext, createMemo, createRenderEffect, createSignal, For, on, onCleanup, Owner, ParentProps, useContext } from "solid-js";
import { OrderedLinkedList, OrderedLinkedListNode } from "../helper/orderedLinkedList";
import { Portal } from "solid-js/web";

/** A function that compares the order in which a {@link Source} should be rendered inside a {@link Dest} */
const COMPARATOR = (a: Info, b: Info) => (a.order ?? 0) - (b.order ?? 0);

/** Informations about a single {@link Source} */
type Info = ParentProps<{ order?: number }>;

/** Type of the data stored in the {@link Context} created by each {@link Extractor} */
interface State {
    readonly sources: OrderedLinkedList<Info>;
    readonly extracting: number;
    shift(k: number): void;
    force(): void;
}

/**
 * Friendlier version of the {@link Portal}.
 * It works with arbitrary nesting.
 * The components communicate only if they're part of the same {@link Extractor}.
 * It is uncommon for an {@link Extractor} to be defined inside a component.
 * Example:
 * ```tsx
 * const e = new Extractor();
 * return <>
 *  <e.Joint>
 *      <div id="something">
 *          <e.Dest />
 *      </div>
 *      <div id="something-else">
 *          <e.Source>
 *              This text will be shown instead of `e.Dest`
 *          </e.Source>
 *      </div>
 *  </e.Joint>
 * </>
 * ```
 */
export class Extractor {
    constructor(name?: string) { this.ctx = createContext(undefined, { name }); }

    readonly ctx: Context<State | undefined>;
    Joint = Joint.bind(this);
    Dest = Dest.bind(this);
    Source = Source.bind(this);

    /**
     * Returns the number of destinations available for the current {@link Extractor}.
     * It's a getter that returns a function that will be bound to the {@link Owner} in which the getter was called.
     * If the current {@link Owner} is NOT under a {@link Joint}, it will return `undefined`
     */
    get getDestCount() {
        const state = useContext(this.ctx);
        return state && (() => state.extracting);
    }
}

/** Unbound joint component */
function Joint(this: Extractor, props: ParentProps) {
    const state = createState();
    return <this.ctx.Provider value={state} children={props.children} />
}

/** Unbound destination component */
function Dest(this: Extractor) {
    const state = useContext(this.ctx);
    if (!state) throw new Error("An extractor's destination must be inside one of its joints");
    state.shift(1);
    onCleanup(() => state.shift(-1));
    return <For each={[ ...state.sources ]} children={x => <>{x.children}</>} />
}

/** Unbound source component */
function Source(this: Extractor, props: Info) {
    const state = useContext(this.ctx);
    if (!state) throw new Error("An extractor's source must be inside one of its joints");
    const { sources, force } = state; // Reads them only once, we don't need reactivity here anyway
    const order = createMemo(() => props.order);
    const info = { get order() { return order(); }, get children() { return props.children; } };
    const node = new OrderedLinkedListNode(info);
    createRenderEffect(on(order, () => {
        onCleanup(() => node.remove());
        sources.add(node, COMPARATOR);
        force();
    }));
    return <></>
}

/** Creates a {@link State} object */
function createState(): State {
    const [ getExtracting, setExtracting ] = createSignal(0, { internal: true });
    const [ getSources, setSources ] = createSignal(new OrderedLinkedList<Info>(), { internal: true, equals: false });
    return {
        get sources() { return getSources(); },
        get extracting() { return getExtracting(); },
        shift: k => setExtracting(v => v + k),
        force: () => setSources(s => s)
    };
}