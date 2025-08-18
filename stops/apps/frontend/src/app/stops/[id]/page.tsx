/* * */

import { StopDetail } from '@/components/stops/detail/StopDetail';
import { StopDetailContextProvider } from '@/contexts/StopDetails.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<StopDetailContextProvider stopId={id}>
			<StopDetail />
		</StopDetailContextProvider>
	);
}
