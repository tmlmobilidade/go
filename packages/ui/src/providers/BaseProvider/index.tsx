'use client';

/* * */

import { MantineProvider } from '@mantine/core';
import { DatesProvider, DatesProviderSettings } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { swrFetcher } from '@tmlmobilidade/utils';
import { type PropsWithChildren } from 'react';
import { SWRConfig, type SWRConfiguration } from 'swr';

import { themeData } from '../../styles/theme';

/**
 * This is the application base provider component. The whole application should be
 * wrapped with this component, including non-authenticated parts. Set this on the Root layout,
 * without `<html>` or `<body>` HTML tags.
 */
export function BaseProvider({ children }: PropsWithChildren) {
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
		refreshInterval: 60_000, // 1 minute
		refreshWhenHidden: true,
		revalidateIfStale: true,
		revalidateOnFocus: true,
		revalidateOnMount: true,
	};

	//
	// B. Render components

	return (
		<html data-mode="system" data-theme="ocean" lang="pt">
			<body>
				<SWRConfig value={swrSettings}>
					<MantineProvider defaultColorScheme="auto" theme={themeData}>
						<DatesProvider settings={mantineDatesSettings}>
							<ModalsProvider>
								<Notifications position="bottom-right" />
								{children}
							</ModalsProvider>
						</DatesProvider>
					</MantineProvider>
				</SWRConfig>
			</body>
		</html>
	);

	//
}
