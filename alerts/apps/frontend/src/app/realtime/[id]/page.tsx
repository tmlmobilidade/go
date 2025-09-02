/* * */

import { RealtimeDetail } from '@/components/realtime/detail/RealtimeDetail';
import { RealtimeDetailContextProvider } from '@/contexts/RealtimeDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<RealtimeDetailContextProvider alertId={id}>
			<RealtimeDetail />
		</RealtimeDetailContextProvider>
	);
}
