/* * */

import AlertsPublicList from '@/components/alerts/list/AlertsPublicList';
import { AlertsPublicListHeader } from '@/components/alerts/list/AlertsPublicListHeader';

/* * */

export default function Page() {
	return (
		<>
			<AlertsPublicListHeader />
			<AlertsPublicList />
		</>
	);
}
