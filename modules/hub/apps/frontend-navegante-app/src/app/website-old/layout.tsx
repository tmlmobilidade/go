/* * */

import { WebsiteViewport } from '@/components/viewport/AppViewport';
import { DataProviders } from '@/providers/data-providers';
import { MapProviders } from '@/providers/map-providers';
import { ThemeProviders } from '@/providers/theme-providers';
import { websiteTheme } from '@/themes/website/website.theme';

/* * */

export default function Layout({ children }) {
	return (
		<ThemeProviders themeData={websiteTheme} themeId="website">
			<DataProviders>
				<MapProviders>
					<WebsiteViewport>
						{children}
					</WebsiteViewport>
				</MapProviders>
			</DataProviders>
		</ThemeProviders>
	);
}
