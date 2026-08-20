'use client';

import { MantineProvider, MantineProviderProps } from '@mantine/core';
import { DatesProvider, type DatesProviderSettings } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { type PropsWithChildren, Suspense } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

import { type LocaleContextProps, LocaleContextProvider } from '../../contexts/Locale.context';
import { type VersionContextProps, VersionContextProvider } from '../../contexts/Version.context';
import { swrFetcher } from '../../fetch';
import { LoadingSection } from '../../loaders';
import { themeData } from '../../styles/theme';

/* * */

type BaseProviderProps = LocaleContextProps & VersionContextProps & {
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
export function BaseProvider({ children, i18n, theme, version }: PropsWithChildren<BaseProviderProps>) {
	//

	//
	// A. Setup variables

	const nuqsSettings = {
		processUrlSearchParams: (search: URLSearchParams) => {
			search.sort();
			return search;
		},
	};

	const swrSettings: SWRConfiguration = {
		fetcher: swrFetcher,
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
						</VersionContextProvider>
					</Suspense>
				</NuqsAdapter>
			</body>
		</html>
	);

	//
}
