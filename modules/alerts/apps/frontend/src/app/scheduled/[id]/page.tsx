/* * */

import { ScheduledDetail } from '@/components/scheduled/detail/ScheduledDetail';
import { ScheduledDetailContextProvider } from '@/components/scheduled/detail/ScheduledDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<ScheduledDetailContextProvider alertId={id}>
			<ScheduledDetail />
		</ScheduledDetailContextProvider>
	);
}
