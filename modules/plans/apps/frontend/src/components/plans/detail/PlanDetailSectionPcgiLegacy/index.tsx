'use client';

/* * */

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Collapsible, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionPcgiLegacy() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Dados necessários para manter a PCGI em funcionamento."
			title="PCGI Legacy"
		>
			<Section gap="sm">

				<TextInput
					key={planDetailContext.data.form.key('pcgi_legacy.operation_plan_id')}
					label="Operation Plan ID da PCGI"
					miw="50%"
					placeholder="operationPlanId"
					{...planDetailContext.data.form.getInputProps('pcgi_legacy.operation_plan_id')}
					readOnly={planDetailContext.flags.isReadOnly}
				/>

			</Section>
		</Collapsible>
	);

	//
}
