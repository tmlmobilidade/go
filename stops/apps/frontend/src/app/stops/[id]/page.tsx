/* * */

import { StopDetail } from '@/components/stops/detail/StopDetail';
import { StopDetailContextProvider } from '@/contexts/StopDetails.context';
import { ProposedChangesContextProvider } from '@tmlmobilidade/ui';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<StopDetailContextProvider stopId={id}>
			<ProposedChangesContextProvider stopId={id}>
				<StopDetail />
			</ProposedChangesContextProvider>
		</StopDetailContextProvider>
	);
}
