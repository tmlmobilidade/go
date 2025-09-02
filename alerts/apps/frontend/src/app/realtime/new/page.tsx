/* * */

import { RealtimeDetail } from '@/components/realtime/detail/RealtimeDetail';
import { RealtimeDetailContextProvider } from '@/contexts/RealtimeDetail.context';

/* * */

export default async function Page() {
	return (
		<RealtimeDetailContextProvider>
			<RealtimeDetail />
		</RealtimeDetailContextProvider>
	);
}
