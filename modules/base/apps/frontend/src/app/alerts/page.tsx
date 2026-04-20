/* * */

import { AlertsPublicListPage } from '@/features/alerts-public/components/AlertsPublicListPage';
import { AlertsPublicListContextProvider } from '@/features/alerts-public/contexts/AlertsPublicList.context';

/* * */

export default function Page() {
	return (
		<AlertsPublicListContextProvider>
			<AlertsPublicListPage />
		</AlertsPublicListContextProvider>
	);
}
