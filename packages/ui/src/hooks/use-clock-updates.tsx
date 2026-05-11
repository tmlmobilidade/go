'use client';

import { Dates } from '@tmlmobilidade/dates';
import { useEffect, useMemo, useState } from 'react';

/**
 * A hook that provides the current date and time, updating at a specified interval.
 * This is useful for components that need to display real-time clock information,
 * updated at regular intervals. Using a Dates object in a context or component forces
 * a re-render every time the clock updates, which might trigger updates in dependent components.
 * A solution for this is to setup state management to update a value at a given interval,
 * but that is cumbersome for simple use cases. This hook simplifies that process.
 * @param interval The rate at which to refresh the clock value. Defaults to `second`.
 * @returns A `Dates` object representing the current date and time.
 */
export function useClockUpdates(interval: 'day' | 'hour' | 'millisecond' | 'minute' | 'second'): Dates {
	//

	//
	// A. Setup variables

	const [clockValue, setClockValue] = useState<Dates>();

	//
	// B. Transform data

	const intervalInMilliseconds = useMemo(() => {
		switch (interval) {
			case 'day':
				return 24 * 60 * 60 * 1000;
			case 'hour':
				return 60 * 60 * 1000;
			case 'millisecond':
				return 1;
			case 'minute':
				return 60 * 1000;
			case 'second':
				return 1000;
		}
	}, [interval]);

	//
	// C. Handle actions

	const updateClockValue = () => {
		const value = Dates.now('Europe/Lisbon');
		setClockValue(value);
	};

	useEffect(() => {
		updateClockValue();
		const interval = setInterval(updateClockValue, intervalInMilliseconds);
		return () => clearInterval(interval);
	}, [intervalInMilliseconds]);

	//
	// D. Return data

	return clockValue;

	//
}
