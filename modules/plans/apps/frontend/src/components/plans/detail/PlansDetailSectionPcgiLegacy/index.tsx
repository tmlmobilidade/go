'use client';

/* * */

import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Collapsible, Section, TextInput } from '@go/ui';

/* * */

export function PlansDetailSectionPcgiLegacy() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Dados necessários para manter a PCGI em funcionamento."
			title="PCGI Legacy"
		>
			<Section gap="sm">

				<TextInput
					label="Operation Plan ID da PCGI"
					miw="50%"
					placeholder="operationPlanId"
					{...plansDetailContext.data.form.getInputProps('pcgi_legacy.operation_plan_id')}
					readOnly={plansDetailContext.flags.read_only}
				/>

			</Section>
		</Collapsible>
	);

	//
}
