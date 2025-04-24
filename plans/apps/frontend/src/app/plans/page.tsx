import { PlanList } from '@/components/plans/list/PlansList';
import { PlanListContextProvider } from '@/contexts/PlanList.context';

export default function Page() {
	return (
		<PlanListContextProvider>
			<PlanList />
		</PlanListContextProvider>
	);
}
