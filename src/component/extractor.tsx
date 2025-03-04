
import { ComponentProps, Context, createContext, createMemo, createRenderEffect, createSignal, For, getOwner, JSX, on, onCleanup, Owner, ParentProps, Show, Signal, SignalOptions, splitProps, useContext } from "solid-js";
import { OrderedLinkedList, OrderedLinkedListNode } from "../helper/orderedLinkedList";
import { Portal } from "solid-js/web";
import { SameContext } from "..";

/** A function that compares the order in which a {@link Source} should be rendered inside a {@link Dest} */
const COMPARATOR = (a: Info, b: Info) => (a.order ?? 0) - (b.order ?? 0);

/** Options for the {@link Signal}s inside {@link State} */
const SOURCES_OPTS: SignalOptions<OrderedLinkedList<Info>> = { internal: true, equals: false }, DEST_COUNT_OPTS: SignalOptions<number> = { internal: true };

/** Informations about a single {@link Source} */
type Info = ParentProps<{ order?: number }>;

/** Type of the data stored in the {@link Context} created by each {@link Extractor} */
class State {
    #sources = createSignal(new OrderedLinkedList<Info>(), SOURCES_OPTS);
    #destCount = createSignal<number>(0, DEST_COUNT_OPTS);

    get sources() { return this.#sources[0](); }
    get destCount() { return this.#destCount[0](); }
    shift(k: number) { this.#destCount[1](v => v + k); }
    force() { this.#sources[1](v => v); }
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
 * 
 *          This would have been shown if there wasn't any `e.Dest`
 *          <e.Fallback />
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
    SameContextSource = SameContextSource.bind(this);

    /**
     * Returns the number of destinations available for the current {@link Extractor}.
     * It's a getter that returns a function that will be bound to the {@link Owner} in which the getter was called.
     * If the current {@link Owner} is NOT under a {@link Joint}, it will return `undefined`
     */
    get getDestCount() {
        const state = useContext(this.ctx);
        return state && (() => state.destCount);
    }
}

/** Unbound joint component */
function Joint(this: Extractor, props: ParentProps) {
    const state = new State();
    return <this.ctx.Provider value={state} children={props.children} />
}

/** Unbound destination component */
function Dest(this: Extractor, props: ParentProps) {
    const state = useContext(this.ctx);
    if (!state) return <>{props.children}</>;
    onCleanup(() => state.shift(-1));
    state.shift(1);
    return <>
        <For each={[ ...state.sources ]} fallback={props.children}>
            {x => <>{x.children}</>}
        </For>
    </>
}

/** Unbound source component */
function Source(this: Extractor, props: Info) {
    const state = useContext(this.ctx);
    if (!state) return <></>;
    const { sources } = state; // Reads it only once, we don't need reactivity here anyway
    const order = createMemo(() => props.order);
    const info: Info = { get order() { return order(); }, get children() { return props.children; } };
    const node = new OrderedLinkedListNode(info);
    createRenderEffect(on(order, () => {
        onCleanup(() => {
            node.remove();
            state.force();
        });
        sources.add(node, COMPARATOR);
        state.force();
    }));
}

/** Like {@link Source} but it wraps its children inside a {@link SameContext} */
function SameContextSource(this: Extractor, props: ComponentProps<typeof Source>) {
    const [ mine, other ] = splitProps(props, [ "children" ]);
    const owner = getOwner()!;
    return <>
        <this.Source {...other}>
            <SameContext owner={owner}>
                {mine.children}
            </SameContext>
        </this.Source>
    </>
}