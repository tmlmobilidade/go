'use client';

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, Section, TextInput, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function PlanDetailSectionPcgiLegacy() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const planDetailContext = usePlanDetailContext();

	//
	// B. Transform data

	const canEdit = meContext.actions.hasPermissionResource({
		action: PermissionCatalog.all.plans.actions.update_pcgi_legacy,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.plans.scope,
		value: planDetailContext.data.plan.gtfs_agency.agency_id ?? '',
	});

	//
	// C. Render components

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
					readOnly={planDetailContext.flags.isReadOnly || !canEdit}
				/>
			</Section>
		</Collapsible>
	);

	//
}
