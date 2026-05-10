'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

/* * */

interface UseStateRefProps {

	/**
	 * Optional refresh rate in milliseconds
	 * to update the state from the ref.
	 * @default 1000
	 */
	refreshRate?: number

}

interface UseStateRefReturnType<T> {
	ref: RefObject<T>
	set: (value: T) => void
	state: T
}

/**
 * Custom hook that combines useState and useRef to provide
 * a stateful value with a mutable reference.
 * @param defaultValue The initial state value.
 * @param props Optional properties for configuring the hook.
 * @returns An object containing the state, setter function, and ref.
 */
export function useStateRef<T>(defaultValue: T, props?: UseStateRefProps): UseStateRefReturnType<T> {
	//

	//
	// A. Setup variables

	const ref = useRef<T>(defaultValue);

	const [stateValue, setStateValue] = useState<T>(defaultValue);

	//
	// B. Transform data

	useEffect(() => {
		// Update state value from ref
		// at specified refresh rate
		const interval = setInterval(() => {
			setStateValue(ref.current);
		}, props?.refreshRate ?? 1_000);
		// Cleanup interval on unmount
		return () => clearInterval(interval);
	}, [props?.refreshRate]);

	//
	// C. Handle actions

	const setValue = (value: T) => {
		ref.current = value;
		setStateValue(value);
	};

	//
	// C. Return data

	return {
		ref: ref,
		set: setValue,
		state: stateValue,
	};

	//
};
