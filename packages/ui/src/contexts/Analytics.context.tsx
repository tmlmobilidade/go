'use client';

import { createInstance, type Types } from '@amplitude/analytics-browser';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/* * */

export interface AnalyticsContextProps {
	apiKey?: string
	configurationUrl?: string
	options?: Types.BrowserOptions
}

interface AnalyticsContextState {
	actions: {
		track: (eventName: string, properties?: Record<string, unknown>) => Promise<boolean>
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
export function AnalyticsContextProvider({ apiKey, children, configurationUrl, options }: PropsWithChildren<AnalyticsContextProps>) {
	//

	//
	// A. Setup variables

	const initializationRef = useRef<AnalyticsInitialization | undefined>(undefined);
	const [configuration, setConfiguration] = useState<{
		url: string
		value: Pick<AnalyticsContextProps, 'apiKey' | 'options'>
	}>();
	const [error, setError] = useState<Error | undefined>(undefined);
	const [initialized, setInitialized] = useState<AnalyticsInitialization | undefined>(undefined);
	const remoteConfiguration = configuration?.url === configurationUrl ? configuration?.value : undefined;
	const resolvedApiKey = apiKey ?? remoteConfiguration?.apiKey;
	const resolvedOptions = useMemo(() => remoteConfiguration ? { ...remoteConfiguration.options, ...options } : options, [remoteConfiguration, options]);
	const ready = Boolean(resolvedApiKey) && initialized?.apiKey === resolvedApiKey && initialized?.options === resolvedOptions;

	//
	// B. Handle actions

	const handleError = useCallback((cause: unknown) => {
		setError(cause instanceof Error ? cause : new Error(String(cause)));
	}, []);

	const track = useCallback(async (eventName: string, properties?: Record<string, unknown>) => {
		if (!ready || !initialized || initializationRef.current !== initialized) return false;
		setError(undefined);

		try {
			const result = await initialized.client.track(eventName, properties).promise;
			if (result.code < 200 || result.code >= 300) {
				throw new Error(`Amplitude upload failed (${result.code}): ${result.message}`);
			}
			return true;
		} catch (cause: unknown) {
			if (initializationRef.current === initialized && !initialized.client.getOptOut()) handleError(cause);
			return false;
		}
	}, [handleError, initialized, ready]);

	//
	// C. Handle effects

	useEffect(() => {
		if (apiKey !== undefined || !configurationUrl) return;
		setError(undefined);

		const controller = new AbortController();
		let active = true;

		fetch(configurationUrl, { cache: 'no-store', signal: controller.signal })
			.then((response) => {
				if (!response.ok) throw new Error(`Unable to load analytics configuration: ${response.status}`);
				return response.json();
			})
			.then((value: Pick<AnalyticsContextProps, 'apiKey' | 'options'>) => {
				if (active) setConfiguration({ url: configurationUrl, value });
			})
			.catch((cause: unknown) => {
				if (active) handleError(cause);
			});

		return () => {
			active = false;
			controller.abort();
		};
	}, [apiKey, configurationUrl, handleError]);

	useEffect(() => {
		setError(undefined);
		if (!resolvedApiKey) return;

		let initialization = initializationRef.current;
		if (initialization?.apiKey !== resolvedApiKey || initialization.options !== resolvedOptions) {
			const client = createInstance();
			initialization = {
				apiKey: resolvedApiKey,
				client,
				options: resolvedOptions,
				promise: client.init(resolvedApiKey, { autocapture: false, serverZone: 'EU', ...resolvedOptions }).promise,
			};
			initializationRef.current = initialization;
		}

		const { client, promise } = initialization;
		let active = true;

		promise.then(() => {
			if (!active) return;
			client.setOptOut(resolvedOptions?.optOut ?? false);
			setInitialized(initialization);
		}).catch((cause: unknown) => {
			if (active) handleError(cause);
		});

		return () => {
			active = false;
			client.setOptOut(true);
		};
	}, [handleError, resolvedApiKey, resolvedOptions]);

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
