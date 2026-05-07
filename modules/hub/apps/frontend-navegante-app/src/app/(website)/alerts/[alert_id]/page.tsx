/* * */

import { AlertsDetail } from '@/components/alerts/AlertsDetail';

/* * */

export default async function Page({ params }) {
	const { alert_id } = await params;
	return <AlertsDetail alertId={alert_id} />;
}
