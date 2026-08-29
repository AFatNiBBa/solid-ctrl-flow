
import { createSignal } from "solid-js";

/** Object that reactively tells whether a CSS transition is currently in progress */
export class TransitionMonitor {
    readonly #signal = createSignal(false);

    /** Whether a transition is currently in progress */
    get pending() { return this.#signal[0](); }

    /**
     * Starts waiting for the transition to end.
     * This function should be called immediately before the transition is triggered.
     * If a transition is already in progress, this function does nothing, allowing the object to keep monitoring the previous transition, but the returned {@link Promise} will not wait for the latter to complete
     * @param ctrl The element on which the transition will occur
     * @returns A {@link Promise} that resolves to whether monitoring completed successfully or was cancelled because a transition was already in progress
     */
    async start(ctrl: HTMLElement) {
        const [ g, s ] = this.#signal;
        if (g()) return false;
        s(true);
        try { await new Promise(t => ctrl.addEventListener("transitionend", t, { once: true })); }
        finally { s(false); }
        return true;
    }
}