/* * */

import { PlanDetail } from '@/components/detail/PlanDetail';
import { PlanDetailContextProvider } from '@/contexts/PlanDetail.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<PlanDetailContextProvider planId={id}>
			<PlanDetail />
		</PlanDetailContextProvider>
	);
}
