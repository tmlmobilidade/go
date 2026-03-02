/* * */

import { FareDetail } from '@/components/fares/detail/FareDetail';
import { FareDetailContextProvider } from '@/components/fares/detail/FareDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<FareDetailContextProvider fareId={id}>
			<FareDetail />
		</FareDetailContextProvider>
	);
}
