/* * */

import { StopsDetail } from '@/components/stops/detail/StopsDetail';
import { StopsDetailContextProvider } from '@/components/stops/detail/StopsDetail.context';

/* * */

export default async function Page({ params }) {
	const { stop_id } = await params;

	return (
		<StopsDetailContextProvider stopId={stop_id}>
			<StopsDetail />
		</StopsDetailContextProvider>
	);
}
