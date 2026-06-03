'use client';

import { useLocalStorage } from '@mantine/hooks';

interface UseActiveViewReturnType<T> {
	activeView: T
	availableViews: T[]
	toggleView: (view: T) => void
}

/**
 * A hook that provides the active and available transit modes.
 * @returns An object with the active and available transit modes, and a function to toggle a transit mode.
 */
export function useActiveView<T>(key: string, availableViews: T[]): UseActiveViewReturnType<T> {
	//

	//
	// A. Setup variables

	const [activeView, setActiveView] = useLocalStorage<T>({
		defaultValue: availableViews[0],
		key,
	});

	//
	// B. Handle actions

	const toggleView = (view: T) => {
		setActiveView(view);
	};

	//
	// C. Return data

	return {
		activeView,
		availableViews,
		toggleView,
	};
}
