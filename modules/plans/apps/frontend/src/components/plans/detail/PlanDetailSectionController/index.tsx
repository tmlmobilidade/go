'use client';

/* * */

import { PlanStatusTag } from '@/components/common/PlanStatusTag';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Button, Collapsible, Section, Tag } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionController() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Configurações relacionadas com a conversão deste plano em Rides."
			title="Definições SLA"
		>
			<Section gap="sm">

				<PlanStatusTag status={planDetailContext.data.plan.apps?.controller?.status} />

				<Tag label={planDetailContext.data.plan.hash || 'N/A'} variant="secondary" />
				<Tag label={planDetailContext.data.plan.apps?.controller?.last_hash || 'N/A'} variant="secondary" />

				<Button
					disabled={planDetailContext.flags.isReadOnly}
					label="Reprocessar Plano"
					loading={planDetailContext.flags.isSaving}
					onClick={planDetailContext.actions.controllerReprocessPlan}
				/>

			</Section>
		</Collapsible>
	);

	//
}
