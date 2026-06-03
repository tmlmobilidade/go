/* * */

import { StopsDetail } from '@/components/stops/detail/StopsDetail';
import { StopsDetailContextProvider } from '@/components/stops/detail/StopsDetail.context';

/* * */

export default async function Page({ params }) {
	const { stop_id } = await params;
	const decodedStopId = decodeURIComponent(stop_id);
	return (
		<StopsDetailContextProvider stopId={decodedStopId}>
			<StopsDetail />
		</StopsDetailContextProvider>
	);
}
