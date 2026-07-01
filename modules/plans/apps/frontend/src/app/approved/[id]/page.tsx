/* * */

import { PlanDetail } from '@/components/plans/detail/PlanDetail';
import { PlanDetailContextProvider } from '@/components/plans/detail/PlanDetail.context';
import { PlansExportPdfsContextProvider } from '@/contexts/PlansExportPdfs.context';

/* * */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return (
		<PlanDetailContextProvider planId={id}>
			<PlansExportPdfsContextProvider planId={id}>
				<PlanDetail />
			</PlansExportPdfsContextProvider>
		</PlanDetailContextProvider>
	);
}
