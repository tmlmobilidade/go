/* * */

import AlertsPublicList from '@/components/modules/alerts/list/AlertsPublicList';
import { AlertsPublicListContextProvider } from '@/contexts/AlertsPublicList.context';
import { LinesContextProvider } from '@/contexts/Lines.context';
import { StopsContextProvider } from '@/contexts/Stops.context';
import { AgenciesContextProvider } from '@tmlmobilidade/ui';

/* * */

export default function Layout() {
	return (
		<LinesContextProvider>
			<StopsContextProvider>
				<AgenciesContextProvider>
					<AlertsPublicListContextProvider>
						<AlertsPublicList />
					</AlertsPublicListContextProvider>
				</AgenciesContextProvider>
			</StopsContextProvider>
		</LinesContextProvider>
	);
}
