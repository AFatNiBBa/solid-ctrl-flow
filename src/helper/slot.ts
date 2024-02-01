
/** Element which tracks its index in its containing array */
export interface Slot { slot?: number; }

/** Utility of {@link Slot}s */
export namespace Slot {
    /**
     * Pushes an element into a slotted list
     * @param list The list in which to add the element
     * @param v The element to add to {@link list}
     * @returns The index of the new element
     */
    export const push = <T extends Slot>(list: T[], v: T) => v.slot = list.push(v) - 1;

    /**
     * Exactly like {@link removeSlotAt}, but it gets the index from {@link v}
     * @param list The list from which to remove the element
     * @param v The element to remove from {@link list}
     * @returns The removed element
     */
    export const remove = <T extends Slot>(list: T[], v: T) => v.slot != null ? removeAt(list, v.slot) : v;

    /**
     * Removes an element from a slotted list
     * @param list The list from which to remove the element
     * @param i The index at which to remove the element
     * @returns The removed element
     */
    export function removeAt<T extends Slot>(list: T[], i: number) {
        if (i >= list.length) return;
        const last = list.pop()!;
        if (i === list.length) return last; // (It checks against `list.length` instead of `list.length - 1` because `list.pop()` removed an element)
        const out = list[i];
        out.slot = undefined;
        list[last.slot = i] = last;
        return out;
    }
}