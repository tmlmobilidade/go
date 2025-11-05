'use client';

/* * */

import { ExportsContextProvider } from '@/contexts/exports.context';
import { MapContextProvider } from '@/contexts/Map.context';
import { MeContextProvider } from '@/contexts/Me.context';
import { NotificationsContextProvider } from '@/contexts/Notifications.context';
import { ThemeContextProvider } from '@/contexts/Theme.context';
import { type PropsWithChildren } from 'react';

/**
 * `AppProvider` component that wraps the application with necessary context providers.
 * This should wrap the whole authenticated application. For non-authenticated
 * parts of the application, use only the `BaseProvider` component.
 */
export function AppProvider({ children }: PropsWithChildren) {
	return (
		<MeContextProvider>

			<NotificationsContextProvider>
				<ExportsContextProvider>
					<ThemeContextProvider>
						<MapContextProvider>
							{children}
						</MapContextProvider>
					</ThemeContextProvider>
				</ExportsContextProvider>
			</NotificationsContextProvider>
		</MeContextProvider>
	);
}
