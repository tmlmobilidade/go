'use client';

import { MantineProvider, MantineProviderProps } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AnalyticsContextProps, AnalyticsContextProvider } from '@tmlmobilidade/go-ui-analytics';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type PropsWithChildren, Suspense, useMemo } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

import { useMeData } from '../../auth/use-me-data';
import { type LocaleContextProps, LocaleContextProvider } from '../../contexts/Locale.context';
import { type VersionContextProps, VersionContextProvider } from '../../contexts/Version.context';
import { LoadingSection } from '../../loaders';
import { themeData } from '../../styles/theme';
import { LocalizedDatesProvider } from '../LocalizedDatesProvider';

/* * */

type BaseProviderProps = LocaleContextProps & VersionContextProps & {
	analytics?: AnalyticsContextProps

	/**
	 * Please avoid using this prop. It is only intended for very specific use cases.
	 * @dangerous
	 */
	theme?: MantineProviderProps['theme']

};

/**
 * This is the application base provider component. The whole application should be
 * wrapped with this component, including non-authenticated parts. Set this on the Root layout,
 * without `<html>` or `<body>` HTML tags.
 */
export function BaseProvider({ analytics, children, i18n, theme, version }: PropsWithChildren<BaseProviderProps>) {
	//

	//
	// Setup variables

	const analyticsApiKey = analytics?.apiKey ?? process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
	const { data: meData, error: meError, isAuthenticated } = useMeData(analyticsApiKey !== '', 30_000);
	const analyticsUser = useMemo<AnalyticsContextProps['user']>(() => {
		if (analytics?.user !== undefined) return analytics.user;
		if (isAuthenticated === undefined) return undefined;
		return meData ? { _id: meData._id, email: meData.email, name: `${meData.first_name} ${meData.last_name}` } : null;
	}, [analytics?.user, isAuthenticated, meData]);

	const analyticsOptions = useMemo<AnalyticsContextProps['options']>(() => ({
		appVersion: version,
		...(process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE ? { serverZone: process.env.NEXT_PUBLIC_AMPLITUDE_SERVER_ZONE === 'US' ? 'US' : 'EU' } : {}),
		...analytics?.options,
	}), [analytics?.options, version]);

	const nuqsSettings = {
		processUrlSearchParams: (search: URLSearchParams) => {
			search.sort();
			return search;
		},
	};

	const swrSettings: SWRConfiguration = {
		refreshInterval: 600_000, // 10 minutes
		refreshWhenHidden: false,
		revalidateIfStale: true,
		revalidateOnFocus: true,
	};

	//
	// Render components

	return (
		<html
			data-mode="light"
			data-scroll-behavior="smooth"
			data-theme="ocean"
			lang="pt"
		>
			<body>
				<NuqsAdapter {...nuqsSettings}>
					<Suspense fallback={<LoadingSection fullHeight />}>
						<VersionContextProvider version={version}>
							<AnalyticsContextProvider
								apiKey={analyticsApiKey}
								configurationUrl={analytics?.configurationUrl ?? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/analytics`}
								options={analyticsOptions}
								replayAuthorization={analytics?.replayAuthorization !== undefined ? analytics.replayAuthorization : meError ? undefined : meData?.session_replay}
								replayStartUrl={analytics?.replayStartUrl ?? API_ROUTES.core.ME_SESSION_REPLAY_START}
								user={analyticsUser}
							>
								<SWRConfig value={swrSettings}>
									<LocaleContextProvider i18n={i18n}>
										<MantineProvider defaultColorScheme="auto" theme={theme ?? themeData}>
											<LocalizedDatesProvider>
												<ModalsProvider>
													<Notifications position="bottom-right" />
													{children}
												</ModalsProvider>
											</LocalizedDatesProvider>
										</MantineProvider>
									</LocaleContextProvider>
								</SWRConfig>
							</AnalyticsContextProvider>
						</VersionContextProvider>
					</Suspense>
				</NuqsAdapter>
			</body>
		</html>
	);

	//
}
