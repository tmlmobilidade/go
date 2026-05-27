'use client';

import { MantineProvider } from '@mantine/core';
import { DatesProvider, type DatesProviderSettings } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { swrFetcher } from '@tmlmobilidade/utils';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { type PropsWithChildren, Suspense } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

import { LoadingSection } from '../../components/loaders/LoadingSection';
import { type LocaleContextProps, LocaleContextProvider } from '../../contexts/Locale.context';
import { type VersionContextProps, VersionContextProvider } from '../../contexts/Version.context';
import { themeData } from '../../styles/theme';

/* * */

type BaseProviderProps = LocaleContextProps & VersionContextProps;

/**
 * This is the application base provider component. The whole application should be
 * wrapped with this component, including non-authenticated parts. Set this on the Root layout,
 * without `<html>` or `<body>` HTML tags.
 */
export function BaseProvider({ children, i18n, version }: PropsWithChildren<BaseProviderProps>) {
	//

	//
	// A. Setup variables

	const mantineDatesSettings: Partial<DatesProviderSettings> = {
		firstDayOfWeek: 1,
		locale: 'pt',
		weekendDays: [6, 0],
	};

	const swrSettings: SWRConfiguration = {
		fetcher: swrFetcher,
		refreshInterval: 600_000, // 10 minutes
		refreshWhenHidden: true,
		revalidateIfStale: true,
		revalidateOnFocus: true,
		revalidateOnMount: true,
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
				<NuqsAdapter>
					<Suspense fallback={<LoadingSection fullHeight />}>
						<VersionContextProvider version={version}>
							<SWRConfig value={swrSettings}>
								<LocaleContextProvider i18n={i18n}>
									<MantineProvider defaultColorScheme="auto" theme={themeData}>
										<DatesProvider settings={mantineDatesSettings}>
											<ModalsProvider>
												<Notifications position="bottom-right" />
												{children}
											</ModalsProvider>
										</DatesProvider>
									</MantineProvider>
								</LocaleContextProvider>
							</SWRConfig>
						</VersionContextProvider>
					</Suspense>
				</NuqsAdapter>
			</body>
		</html>
	);

	//
}
