
import { ComponentProps, mergeProps, splitProps } from "solid-js";
import { memoProps, splitAndMemoProps } from "../helper/memo";
import { Spread } from "..";

/** Handy type alias */
type div = ComponentProps<"div">;

/**
 * Simple {@link HTMLDivElement} that accepts another set of attributes to merge with the base ones.
 * Specifically, {@link div.ref}, {@link div.class}, {@link div.classList}, and {@link div.style} are combined rather than overwritten by the second set of attributes.
 * Used for customizable structural parts of components
 */
export function Part(props: { props: div | undefined } & div) {
    const [ mine, first, second, other, user ] = processProps(props);
    return <>
        <div
            {...other}
            {...user}                           // Solid's compiler already merges the first two "ref"s, because the manual one gets special-cased and the other gets passed through "spread()", but it does together with every other spread parameter, so there must be one maximum across every spread
            ref={x => <Spread target={x} ref={mine.ref} style={mine.style} />}
            classList={{
                [first.class ?? ""]: true,
                [second.class ?? ""]: true,     // A key containing only spaces breaks, so the optional classes are kept as separate properties
                ...first.classList,
                ...second.classList
            }}
        />
    </>
}

/**
 * Splits and prepares the attributes passed to a {@link Part}
 * @param props The attributes to process
 */
function processProps(props: ComponentProps<typeof Part>) {
    const [ mine, temp, other ] = splitProps(props, [ "ref", "style", "props" ], [ "class", "classList" ]), first = memoProps(temp);
    const [ second, user ] = splitAndMemoProps(mergeProps(() => mine.props), [ "class", "classList" ]);
    return [ mine, first, second, other, user ] as const;
}