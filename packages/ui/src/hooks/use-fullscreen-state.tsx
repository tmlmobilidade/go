'use client';

import { useEffect, useState } from 'react';

/**
 * A custom hook to get the current fullscreen state.
 * @param refreshRate The rate at which to refresh the fullscreen state. Defaults to `100` ms.
 * @returns The current fullscreen state.
 */
export function useFullscreenState(refreshRate?: number): [boolean | undefined, () => void] {
	//

	//
	// A. Setup variables

	const [fullscreenValue, setFullscreenValue] = useState<boolean | undefined>();

	//
	// B. Handle actions

	const updateFullscreenValue = () => {
		if (typeof document === 'undefined') return;
		setFullscreenValue(!!document.fullscreenElement);
	};

	useEffect(() => {
		updateFullscreenValue();
		const interval = setInterval(updateFullscreenValue, refreshRate ?? 100);
		return () => clearInterval(interval);
	}, []);

	const toggleFullscreen = () => {
		if (typeof document === 'undefined') return;
		if (document.fullscreenElement) document.exitFullscreen();
		else document.documentElement.requestFullscreen({ navigationUI: 'hide' });
	};

	//
	// C. Render components

	return [fullscreenValue, toggleFullscreen];

	//
}
