'use client';

import { useEffect, useMemo, useState } from 'react';

import { type AnalyticsConfiguration, type AnalyticsContextProps } from '../types/analytics';

/* * */

/** Resolves explicit settings and loads runtime configuration when no API key is supplied. */
export function useAnalyticsConfiguration({ apiKey, configurationUrl, experimentDeploymentKey, options }: AnalyticsContextProps, onError: (cause: unknown) => void, onLoad: () => void) {
	const [configuration, setConfiguration] = useState<{
		url: string
		value: AnalyticsConfiguration
	}>();
	// Ignore settings fetched from a previous URL while the current request is pending.
	const remoteConfiguration = configuration?.url === configurationUrl ? configuration?.value : undefined;
	// Explicit props take precedence over values returned by the configuration endpoint.
	const resolvedApiKey = apiKey ?? remoteConfiguration?.apiKey;
	const resolvedExperimentDeploymentKey = experimentDeploymentKey ?? remoteConfiguration?.experimentDeploymentKey;
	const resolvedOptions = useMemo(() => remoteConfiguration ? { ...remoteConfiguration.options, ...options } : options, [remoteConfiguration, options]);

	// Keep the network request in React's lifecycle so URL changes and unmounts cancel it.
	useEffect(() => {
		if (apiKey !== undefined || !configurationUrl) return;
		// Despite its name, onLoad runs before fetching; the caller uses it to clear stale errors.
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
			// Abort the request and ignore responses that still complete after cleanup.
			active = false;
			controller.abort();
		};
	}, [apiKey, configurationUrl, onError, onLoad]);

	return { apiKey: resolvedApiKey, experimentDeploymentKey: resolvedExperimentDeploymentKey, options: resolvedOptions };
}
