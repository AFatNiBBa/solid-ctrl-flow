
import { Accessor, Setter, Signal, createMemo, createSignal, on, untrack } from "solid-js";

/** Reactive atomic value without the inconveniences of {@link Signal} */
export class Atom<T> {
	get value() { return this.get(); }
	
	set value(v: T) { this.set(v); }

	constructor(public get: Accessor<T>, public set: (x: T) => void) { }

	/**
     * Allows you to set the current {@link Atom} based on its current value.
     * The current value gets read through {@link untrack} to mimic the {@link Setter} behaviour
     * @param f Function that creates a new value based on the current one
     */
	update<V extends T>(f: (prev: T) => V): V {
		return this.value = f(untrack(this.get));
	}

    /**
     * Creates an {@link Atom} that forwards an {@link Accessor} to another {@link Atom}
     * @param f The reactive {@link Accessor} to the {@link Atom} to forward
     */
	static unwrap<T>(f: Accessor<Atom<T>>) {
		return new this(() => f().value, x => f().value = x);
	}

    /**
     * Creates an {@link Atom} based on a {@link Signal}
     * @param param0 The {@link Signal} to forward
     */
	static from<T>([ get, set ]: Signal<T>) {
		return new this(get, v => set(() => v));
	}

	/**
     * Creates a new {@link Atom} that applies a conversion to another {@link Atom}
     * @param atom The {@link Atom} to which to apply the conversion
     * @param to Conversion function from {@link S} to {@link D}
     * @param from Conversion function from {@link D} to {@link S}
     */
	static convert<S, D>(atom: Atom<S>, to: (x: S) => D, from: (x: D) => S) {
		return new this(() => to(atom.value), x => atom.value = from(x));
	}

	/**
     * Creates a bindable data source.
     * If {@link bind} returns an {@link Atom} it gets wrapped, otherwise it creates a {@link Signal} using {@link f} and uses it to store the value until {@link bind}'s value changes
     * @param bind The bound {@link Atom}
     * @param f The function that will create the actual {@link Signal} that will store the {@link Atom}'s data in case that {@link bind} doesn't return anything
     */
	static source<T>(bind: Accessor<Atom<T> | undefined>): Atom<T | undefined>;
	static source<T>(bind: Accessor<Atom<T> | undefined>, f: Accessor<Signal<T>>): Atom<T>;
	static source<T>(bind: Accessor<Atom<T> | undefined>, f: Accessor<Signal<T | undefined>> = createSignal<T>) {
		return this.unwrap(createMemo(on(bind, x => x as Atom<T | undefined> ?? Atom.from(f()))));
	}
}