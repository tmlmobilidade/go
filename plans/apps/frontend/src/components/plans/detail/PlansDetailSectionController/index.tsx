'use client';

/* * */

import { PlanStatusControllerTag } from '@/components/common/PlanStatusControllerTag';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Button, Collapsible, Section } from '@tmlmobilidade/ui';

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
			description="Configurações relacionadas à conversão deste plano em circulações."
			title="Definições SLA"
		>
			<Section gap="sm">

				<PlanStatusControllerTag status={plansDetailContext.data.plan.status_controller} />

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
