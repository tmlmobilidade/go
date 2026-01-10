'use client';

/* * */

import { ExportsContextProvider } from '../../contexts/exports.context';
import { LayoutContextProvider } from '../../contexts/Layout.context';
import { LocaleContextProps, LocaleContextProvider } from '../../contexts/Locale.context';
import { MapContextProvider } from '../../contexts/Map.context';
import { MeContextProvider } from '../../contexts/Me.context';
import { NotificationsContextProvider } from '../../contexts/Notifications.context';

/* * */

type AppProviderProps = LocaleContextProps;

/**
 * `AppProvider` component that wraps the application with necessary context providers.
 * This should wrap the whole authenticated application. For non-authenticated
 * parts of the application, use only the `BaseProvider` component.
 */
export function AppProvider({ children, i18n }: PropsWithChildren<AppProviderProps>) {
	return (
		<MeContextProvider>
			<LocaleContextProvider i18n={i18n}>
				<NotificationsContextProvider>
					<ExportsContextProvider>
						<LayoutContextProvider>
							<MapContextProvider>
								{children}
							</MapContextProvider>
						</LayoutContextProvider>
					</ExportsContextProvider>
				</NotificationsContextProvider>
			</LocaleContextProvider>
		</MeContextProvider>
	);
}
