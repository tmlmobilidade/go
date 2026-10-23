'use client';

import { MantineProvider, MantineProviderProps } from '@mantine/core';
import { DatesProvider, type DatesProviderSettings } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { type AnalyticsContextProps, AnalyticsContextProvider } from '@tmlmobilidade/go-ui-analytics';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type PropsWithChildren, Suspense, useMemo } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

import { useMeData } from '../../auth/use-me-data';
import { type LocaleContextProps, LocaleContextProvider } from '../../contexts/Locale.context';
import { type VersionContextProps, VersionContextProvider } from '../../contexts/Version.context';
import { LoadingSection } from '../../loaders';
import { themeData } from '../../styles/theme';

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
	// A. Setup variables

	const { data: meData, isLoading: isMeLoading } = useMeData();
	const analyticsUser = useMemo<AnalyticsContextProps['user']>(() => {
		if (analytics?.user !== undefined) return analytics.user;
		if (isMeLoading) return undefined;
		return meData ? { _id: meData._id, email: meData.email, name: `${meData.first_name} ${meData.last_name}` } : null;
	}, [analytics?.user, isMeLoading, meData]);

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

	const mantineDatesSettings: Partial<DatesProviderSettings> = {
		firstDayOfWeek: 1,
		locale: 'pt',
		weekendDays: [6, 0],
	};

	//
	// B. Render components

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
								apiKey={analytics?.apiKey ?? process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY}
								configurationUrl={analytics?.configurationUrl ?? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/analytics`}
								experimentDeploymentKey={analytics?.experimentDeploymentKey ?? process.env.NEXT_PUBLIC_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY}
								options={analyticsOptions}
								user={analyticsUser}
							>
								<SWRConfig value={swrSettings}>
									<LocaleContextProvider i18n={i18n}>
										<MantineProvider defaultColorScheme="auto" theme={theme ?? themeData}>
											<DatesProvider settings={mantineDatesSettings}>
												<ModalsProvider>
													<Notifications position="bottom-right" />
													{children}
												</ModalsProvider>
											</DatesProvider>
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
