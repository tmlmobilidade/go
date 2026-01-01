/* * */

import { RealtimeCreate } from '@/components/create/RealtimeCreate';
import { RealtimeCreateContextProvider } from '@/components/create/RealtimeCreate.context';

/* * */

export default async function Page() {
	return (
		<RealtimeCreateContextProvider>
			<RealtimeCreate />
		</RealtimeCreateContextProvider>
	);
}
