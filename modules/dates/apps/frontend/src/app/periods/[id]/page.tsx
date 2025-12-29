/* * */

import { PeriodsDetail } from '@/components/periods/detail/PeriodsDetail';
import { PeriodsDetailContextProvider } from '@/components/periods/detail/PeriodsDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<PeriodsDetailContextProvider periodId={id}>
			<PeriodsDetail />
		</PeriodsDetailContextProvider>
	);
}
