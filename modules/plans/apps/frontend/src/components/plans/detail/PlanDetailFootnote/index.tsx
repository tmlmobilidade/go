/* * */

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Dates } from '@tmlmobilidade/dates';
import { Label, Section, UserTag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function PlanDetailFootnote() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Transform data

	const formattedDateString = useMemo(() => {
		// Skip if no value
		if (!planDetailContext.data.plan.created_at) return 'N/A';
		// Convert the Unix timestamp to a Date object.
		return Dates
			.fromUnixTimestamp(planDetailContext.data.plan.created_at)
			.toLocaleString({ day: '2-digit', hour: '2-digit', minute: '2-digit', month: 'long', year: 'numeric' }, 'pt-PT');
	}, [planDetailContext.data.plan.created_at]);

	//
	// C. Render components

	return (
		<Section>
			<Label size="sm">Plano criado por <UserTag userId={planDetailContext.data.plan.created_by} variant="inline" /> a {formattedDateString}</Label>
		</Section>
	);

	//
}
