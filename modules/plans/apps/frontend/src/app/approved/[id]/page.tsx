/* * */

import { PlanDetail } from '@/components/plans/detail/PlanDetail';
import { PlanDetailContextProvider } from '@/components/plans/detail/PlanDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<PlanDetailContextProvider planId={id}>
			<PlanDetail />
		</PlanDetailContextProvider>
	);
}
