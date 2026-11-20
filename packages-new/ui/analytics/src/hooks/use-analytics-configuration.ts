'use client';

import { useEffect, useMemo, useState } from 'react';

import { type AnalyticsConfiguration, type AnalyticsContextProps } from '../types/analytics.js';

/* * */

interface UseAnalyticsConfigurationReturnType {
	apiKey: string | undefined
	options: AnalyticsContextProps['options']
}

/* * */

export function useAnalyticsConfiguration({ apiKey, configurationUrl, options }: AnalyticsContextProps, onError: (cause: unknown) => void, onLoadStart: () => void): UseAnalyticsConfigurationReturnType {
	//

	//
	// Setup variables

	const [configuration, setConfiguration] = useState<{
		url: string
		value: AnalyticsConfiguration
	}>();

	// Ignore configuration fetched from a previous URL.
	const remoteConfiguration = configuration?.url === configurationUrl ? configuration?.value : undefined;

	// Explicit props override runtime configuration.
	const resolvedApiKey = apiKey ?? remoteConfiguration?.apiKey;
	const resolvedOptions = useMemo(() => remoteConfiguration ? { ...remoteConfiguration.options, ...options } : options, [remoteConfiguration, options]);

	//
	// Load configuration

	useEffect(() => {
		if (apiKey !== undefined || !configurationUrl) return;
		onLoadStart();

		const controller = new AbortController();

		fetch(configurationUrl, { cache: 'no-store', signal: controller.signal })
			.then((response) => {
				if (!response.ok) throw new Error(`Unable to load analytics configuration: ${response.status}`);
				return response.json();
			})
			.then((value: AnalyticsConfiguration) => {
				if (!controller.signal.aborted) setConfiguration({ url: configurationUrl, value });
			})
			.catch((cause: unknown) => {
				if (!controller.signal.aborted) onError(cause);
			});

		return () => controller.abort();
	}, [apiKey, configurationUrl, onError, onLoadStart]);

	//
	// Return configuration

	return { apiKey: resolvedApiKey, options: resolvedOptions };
}
