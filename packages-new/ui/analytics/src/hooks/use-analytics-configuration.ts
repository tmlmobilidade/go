'use client';

import { useEffect, useMemo, useState } from 'react';

import { type AnalyticsConfiguration, type AnalyticsContextProps } from '../types/shared/analytics.js';

/* * */

export function useAnalyticsConfiguration({ apiKey, configurationUrl, options }: AnalyticsContextProps, onError: (cause: unknown) => void, onLoad: () => void) {
	const [configuration, setConfiguration] = useState<{
		url: string
		value: AnalyticsConfiguration
	}>();
	const remoteConfiguration = configuration?.url === configurationUrl ? configuration?.value : undefined;
	const resolvedApiKey = apiKey ?? remoteConfiguration?.apiKey;
	const resolvedOptions = useMemo(() => remoteConfiguration ? { ...remoteConfiguration.options, ...options } : options, [remoteConfiguration, options]);

	useEffect(() => {
		if (apiKey !== undefined || !configurationUrl) return;
		onLoad();

		const controller = new AbortController();
		let active = true;

		fetch(configurationUrl, { cache: 'no-store', signal: controller.signal })
			.then((response) => {
				if (!response.ok) throw new Error(`Unable to load analytics configuration: ${response.status}`);
				return response.json();
			})
			.then((value: AnalyticsConfiguration) => {
				if (active) setConfiguration({ url: configurationUrl, value });
			})
			.catch((cause: unknown) => {
				if (active) onError(cause);
			});

		return () => {
			active = false;
			controller.abort();
		};
	}, [apiKey, configurationUrl, onError, onLoad]);

	return { apiKey: resolvedApiKey, options: resolvedOptions };
}
