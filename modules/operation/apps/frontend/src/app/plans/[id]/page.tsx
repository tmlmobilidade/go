/* * */

import { PlanDetail } from '@/components/plans/detail/PlanDetail';
import { PlanDetailContextProvider } from '@/components/plans/detail/PlanDetailForm.context';

/* * */

export default function Page() {
	return (
		<PlanDetailContextProvider>
			<PlanDetail />
		</PlanDetailContextProvider>
	);
}
