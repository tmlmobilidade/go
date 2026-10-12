'use client';

import { createInstance, type Types } from '@amplitude/analytics-browser';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/* * */

export interface AnalyticsContextProps {
	apiKey?: string
	options?: Types.BrowserOptions
}

interface AnalyticsContextState {
	actions: {
		track: (eventName: string, properties?: Record<string, unknown>) => void
	}
	flags: {
		error: Error | undefined
		ready: boolean
	}
}

interface AnalyticsInitialization {
	apiKey: string
	client: ReturnType<typeof createInstance>
	options: AnalyticsContextProps['options']
	promise: Promise<void>
}

/* * */

const AnalyticsContext = createContext<AnalyticsContextState | undefined>(undefined);

export function useAnalyticsContext() {
	const context = useContext(AnalyticsContext);
	if (!context) {
		throw new Error('useAnalyticsContext must be used within an AnalyticsContextProvider');
	}
	return context;
}

/* * */

/** Initializes an isolated client. Tracking is inactive until `flags.ready` is true. */
export function AnalyticsContextProvider({ apiKey, children, options }: PropsWithChildren<AnalyticsContextProps>) {
	//

	//
	// A. Setup variables

	const initializationRef = useRef<AnalyticsInitialization | undefined>(undefined);
	const [error, setError] = useState<Error | undefined>(undefined);
	const [initialized, setInitialized] = useState<AnalyticsInitialization | undefined>(undefined);
	const ready = Boolean(apiKey) && initialized?.apiKey === apiKey && initialized?.options === options;

	//
	// B. Handle actions

	const handleError = useCallback((cause: unknown) => {
		setError(cause instanceof Error ? cause : new Error(String(cause)));
	}, []);

	const track = useCallback((eventName: string, properties?: Record<string, unknown>) => {
		if (!ready || !initialized || initializationRef.current !== initialized) return;

		initialized.client.track(eventName, properties).promise.catch((cause: unknown) => {
			if (initializationRef.current === initialized && !initialized.client.getOptOut()) handleError(cause);
		});
	}, [handleError, initialized, ready]);

	//
	// C. Handle effects

	useEffect(() => {
		setError(undefined);
		if (!apiKey) return;

		let initialization = initializationRef.current;
		if (initialization?.apiKey !== apiKey || initialization.options !== options) {
			const client = createInstance();
			initialization = {
				apiKey,
				client,
				options,
				promise: client.init(apiKey, { autocapture: false, ...options }).promise,
			};
			initializationRef.current = initialization;
		}

		const { client, promise } = initialization;
		let active = true;

		promise.then(() => {
			if (!active) return;
			client.setOptOut(options?.optOut ?? false);
			setInitialized(initialization);
		}).catch((cause: unknown) => {
			if (active) handleError(cause);
		});

		return () => {
			active = false;
			client.setOptOut(true);
		};
	}, [apiKey, handleError, options]);

	//
	// D. Define context value

	const contextValue: AnalyticsContextState = useMemo(() => ({
		actions: {
			track,
		},
		flags: {
			error,
			ready,
		},
	}), [error, ready, track]);

	//
	// E. Render components

	return (
		<AnalyticsContext.Provider value={contextValue}>
			{children}
		</AnalyticsContext.Provider>
	);

	//
}
