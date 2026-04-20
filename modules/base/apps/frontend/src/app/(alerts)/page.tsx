/* * */

import AlertsPublicList from '@/components/modules/alerts/list/AlertsPublicList';
import { AlertsPublicListHeader } from '@/components/modules/alerts/list/AlertsPublicListHeader';
import { AlertsPublicListContextProvider } from '@/contexts/AlertsPublicList.context';

/* * */

export default function Page() {
	return (
		<AlertsPublicListContextProvider>
			<AlertsPublicListHeader />
			<AlertsPublicList />
		</AlertsPublicListContextProvider>
	);
}
