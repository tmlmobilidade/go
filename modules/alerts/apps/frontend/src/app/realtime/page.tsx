/* * */

import { RealtimeCreate } from '@/components/realtime/create/RealtimeCreate';
import { RealtimeCreateContextProvider } from '@/contexts/RealtimeCreate.context';

/* * */

export default async function Page() {
	return (
		<RealtimeCreateContextProvider>
			<RealtimeCreate />
		</RealtimeCreateContextProvider>
	);
}
