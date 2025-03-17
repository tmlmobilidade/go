// FlapTickProvider.tsx
'use client';

/* * */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

/* * */

interface FlapsContextState {
	constants: {
		animation_duration: number
	}
	data: {
		tick: number
	}
}

/* * */

const FlapsContext = createContext<FlapsContextState | undefined>(undefined);

export function useFlapsContext() {
	const context = useContext(FlapsContext);
	if (!context) {
		throw new Error('useFlapsContext must be used within a FlapsContextProvider');
	}
	return context;
}

/* * */

export function FlapsContextProvider({ children }: { children: React.ReactNode }) {
	//

	//
	// A. Setup variables

	const TICK_INTERVAL = 100; // milliseconds between ticks

	const tickRef = useRef(0);
	const frameRef = useRef<null | number>(null);

	//
	// B. Transform data

	useEffect(() => {
		let lastTime = performance.now();

		const loop = (time: number) => {
			if (time - lastTime >= TICK_INTERVAL) {
				tickRef.current += 1;
				lastTime = time;
			}
			frameRef.current = requestAnimationFrame(loop);
		};

		frameRef.current = requestAnimationFrame(loop);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, []);

	//
	// C. Define context value

	const contextValue: FlapsContextState = useMemo(() => ({
		constants: {
			animation_duration: TICK_INTERVAL, // milliseconds
		},
		data: {
			tick: tickRef.current,
		},
	}),	[tickRef.current]);

	//
	// D. Render components

	return (
		<FlapsContext.Provider value={contextValue}>
			{children}
		</FlapsContext.Provider>
	);

	//
}
