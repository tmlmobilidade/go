/* * */

import { EventsDetail } from '@/components/events/detail/EventsDetail';
import { EventsDetailContextProvider } from '@/components/events/detail/EventsDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<EventsDetailContextProvider eventId={id}>
			<EventsDetail />
		</EventsDetailContextProvider>
	);
}
