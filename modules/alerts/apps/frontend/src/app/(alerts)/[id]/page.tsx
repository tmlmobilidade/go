/* * */

import { AlertsDetail } from '@/components/detail/AlertsDetail';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<AlertsDetail key="alerts-detail" />
	);
}
