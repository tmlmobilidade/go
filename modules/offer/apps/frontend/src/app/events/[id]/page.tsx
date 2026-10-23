/* * */

import { EventsDetail } from '@/components/events/detail/EventsDetail';
import { EventsDetailFormContextProvider } from '@/components/events/detail/EventsDetailForm.context';

/* * */

export default async function Page() {
	return (
		<EventsDetailFormContextProvider>
			<EventsDetail />
		</EventsDetailFormContextProvider>
	);
}
