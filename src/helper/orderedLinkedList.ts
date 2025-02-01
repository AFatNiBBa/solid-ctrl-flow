
/**
 * Ordered linked list that allows for:
 * - O(n) Iteration
 * - O(n) Insertion
 * - O(1) Removal (With a node reference)
 */
export class OrderedLinkedList<T> {
	next?: OrderedLinkedListNode<T>;

    /** Yields all the elements PAST the current */
	*[Symbol.iterator](): Generator<T> {
		const { next } = this;
		if (!next) return;
		yield next.value;
		yield* next;
	}

    /**
     * Adds a node to the list in order
     * @param node The node to add
     * @param comp The comparison function to use
     * @returns The same value as {@link node}
     */
	add(node: OrderedLinkedListNode<T>, comp: (a: T, b: T) => number): OrderedLinkedListNode<T> {
		const { next } = this;
		if (next && comp(node.value, next.value) > 0) return next.add(node, comp);
		this.next = node;
		node.prev = this;
		if (next) (node.next = next).prev = node;
		return node;
	}
}

/** Node for the {@link OrderedLinkedList} */
export class OrderedLinkedListNode<T> extends OrderedLinkedList<T> {
	constructor(public value: T) { super(); }
    
	prev?: OrderedLinkedList<T>;

    /** Removes the current node from the list */
	remove() {
		const { prev, next } = this;
		if (prev) prev.next = next;
		if (next) next.prev = prev;
		this.next = this.prev = undefined;
	}
}