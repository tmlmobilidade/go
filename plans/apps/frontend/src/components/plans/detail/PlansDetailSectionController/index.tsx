'use client';

/* * */

import { PlanStatusControllerTag } from '@/components/common/PlanStatusControllerTag';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Button, Collapsible, Section, Tag } from '@tmlmobilidade/ui';

/* * */

export function PlansDetailSectionController() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Configurações relacionadas com a conversão deste plano em Rides."
			title="Definições SLA"
		>
			<Section gap="sm">

				<PlanStatusControllerTag status={plansDetailContext.data.plan.controller.status} />

				<Tag label={plansDetailContext.data.plan.hash || 'N/A'} variant="secondary" />

				<Button
					disabled={plansDetailContext.flags.read_only}
					label="Reprocessar Plano"
					loading={plansDetailContext.flags.saving}
					onClick={plansDetailContext.actions.controllerReprocessPlan}
				/>

			</Section>
		</Collapsible>
	);

	//
}
