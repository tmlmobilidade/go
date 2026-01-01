/* * */

import { RealtimeCreate } from '@/components/realtime/create/RealtimeCreate';
import { RealtimeCreateContextProvider } from '@/components/realtime/create/RealtimeCreate.context';

/* * */

export default async function Page() {
	return (
		<RealtimeCreateContextProvider>
			<RealtimeCreate />
		</RealtimeCreateContextProvider>
	);
}
