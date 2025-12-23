/* * */

import { RealtimeCreate } from '@/components/realtime/create/RealtimeCreate';
import { RealtimeCreateContextProvider } from '@/components/realtime/create/RealtimeCreate.context';
import { ScheduledListContextProvider } from '@/components/scheduled/list/ScheduledList.context';

/* * */

export default async function Page() {
	return (
		<ScheduledListContextProvider>
			<RealtimeCreateContextProvider>
				<RealtimeCreate />
			</RealtimeCreateContextProvider>
		</ScheduledListContextProvider>
	);
}
