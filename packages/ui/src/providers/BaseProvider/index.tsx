'use client';

import { MantineProvider, MantineProviderProps } from '@mantine/core';
import { DatesProvider, type DatesProviderSettings } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNextjs } from '@tmlmobilidade/logger/sentry/nextjs';
import { swrFetcher } from '@tmlmobilidade/utils';
import { NuqsAdapter } from 'nuqs/adapters/next';
import { type PropsWithChildren, Suspense } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

import { LoadingSection } from '../../components/loaders/LoadingSection';
import { type LocaleContextProps, LocaleContextProvider } from '../../contexts/Locale.context';
import { type VersionContextProps, VersionContextProvider } from '../../contexts/Version.context';
import { themeData } from '../../styles/theme';

/* * */

type BaseProviderProps = LocaleContextProps & VersionContextProps & {
	/**
	 * The module name. This is used to identify the module in the logs.
	 */
	module?: string

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
export function BaseProvider({ children, i18n, module, theme, version }: PropsWithChildren<BaseProviderProps>) {
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
	// C. Initialize Sentry

	try {
		initSentryNextjs();
		Logger.logsNextjs({ app: 'frontend', message: 'Sentry Auth Frontend initialized', module: module ?? 'ui', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Auth Frontend', error);
	}

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
