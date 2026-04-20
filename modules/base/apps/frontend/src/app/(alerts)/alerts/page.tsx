/* * */

import AlertsPublicList from '@/components/modules/alerts/list/AlertsPublicList';
import { AlertsPublicListHeader } from '@/components/modules/alerts/list/AlertsPublicListHeader';

/* * */

export default function Page() {
	return (
		<>
			<AlertsPublicListHeader />
			<AlertsPublicList />
		</>
	);
}
