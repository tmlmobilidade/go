'use client';

import { type PropsWithChildren } from 'react';

import { AnalyticsContext } from '../contexts/Analytics.context';
import { useAnalytics } from '../hooks/use-analytics';
import { type AnalyticsContextProps } from '../types/analytics';

/* * */

/** Initializes an isolated client. Tracking is inactive until `flags.ready` is true. */
export function AnalyticsContextProvider({ children, ...props }: PropsWithChildren<AnalyticsContextProps>) {
	const value = useAnalytics(props);
	return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
