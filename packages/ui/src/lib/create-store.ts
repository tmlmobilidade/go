'use client';

import { useSyncExternalStore } from 'react';

/**
 * Create a store for a given state.
 * Use this function to create a singleton-like store for a given state object,
 * that reacts to changes and follows standard React practices.
 * @param initialState The initial state of the store.
 * @returns The store object.
 */
export function createStore<T>(initialState: T) {
	//

	let state = initialState;

	const listeners = new Set<() => void>();

	function getState() {
		return state;
	}

	function setState(update: ((current: T) => T) | T) {
		// Handle the update function or the new state object.
		const nextState = typeof update === 'function'
			? (update as (current: T) => T)(state)
			: update;
		// If the state is the same, return.
		if (Object.is(state, nextState)) {
			return;
		}
		// Update the state.
		state = nextState;
		// Notify all listeners.
		listeners.forEach(listener => listener());
	}

	function subscribe(listener: () => void) {
		// Add the listener to the set of listeners.
		listeners.add(listener);
		// Return a function to unsubscribe the listener.
		return () => {
			listeners.delete(listener);
		};
	}

	function useStore() {
		// Use the useSyncExternalStore hook to subscribe to the store.
		return useSyncExternalStore(subscribe, getState);
	}

	return {
		getState,
		setState,
		subscribe,
		useStore,
	};
}
