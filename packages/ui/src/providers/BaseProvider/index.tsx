'use client';

import { MantineProvider, MantineProviderProps } from '@mantine/core';
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
import { LocalizedDatesProvider } from '../LocalizedDatesProvider';

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

	const swrSettings: SWRConfiguration = {
		fetcher: swrFetcher,
		refreshInterval: 600_000, // 10 minutes
		refreshWhenHidden: false,
		revalidateIfStale: true,
		revalidateOnFocus: true,
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
						</VersionContextProvider>
					</Suspense>
				</NuqsAdapter>
			</body>
		</html>
	);

	//
}
