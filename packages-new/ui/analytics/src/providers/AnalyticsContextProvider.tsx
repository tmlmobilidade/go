'use client';

import { type PropsWithChildren } from 'react';

import { AnalyticsContext } from '../contexts/Analytics.context.js';
import { useAnalytics } from '../hooks/use-analytics.js';
import { type AnalyticsContextProps } from '../types/shared/analytics.js';

/* * */

/** Initializes an isolated client. Tracking is inactive until `flags.ready` is true. */
export function AnalyticsContextProvider({ children, ...props }: PropsWithChildren<AnalyticsContextProps>) {
	const value = useAnalytics(props);
	return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
