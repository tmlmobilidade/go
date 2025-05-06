'use client';

import { PlanList } from '@/components/plans/list/PlansList';
import { PlanListContextProvider } from '@/contexts/PlanList.context';

export default function Page() {
	return (
		<>Selectione um plano {process.env.APP_ALERTS_URL}</>
	);
}
