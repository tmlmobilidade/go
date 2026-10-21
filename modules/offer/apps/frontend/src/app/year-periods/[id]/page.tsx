/* * */

import { PeriodsDetail } from '@/components/year-periods/detail/PeriodsDetail';
import { PeriodsDetailContextProvider } from '@/components/year-periods/detail/PeriodsDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<PeriodsDetailContextProvider yearPeriodId={id}>
			<PeriodsDetail />
		</PeriodsDetailContextProvider>
	);
}
