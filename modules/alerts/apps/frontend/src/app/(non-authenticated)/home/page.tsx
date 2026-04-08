/* * */

import AlertsPublicList from '@/components/list/AlertsPublicList';
import { AlertsPublicListHeader } from '@/components/list/AlertsPublicListHeader';
import { AlertsPublicListContextProvider } from '@/contexts/AlertsPublicList.context';

/* * */

export default function Page() {
	//

	//
	// A. Render Components

	return (
		<AlertsPublicListContextProvider>
			<AlertsPublicListHeader />
			<AlertsPublicList />
		</AlertsPublicListContextProvider>
	);

	//
}
