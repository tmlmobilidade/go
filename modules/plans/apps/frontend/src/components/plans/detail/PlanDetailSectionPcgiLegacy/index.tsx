'use client';

/* * */

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, Section, TextInput, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanDetailSectionPcgiLegacy() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const planDetailContext = usePlanDetailContext();
	const { t } = useTranslation('plans', { keyPrefix: 'plans.detail.sectionPcgiLegacy' });

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
			description={t('description')}
			title={t('title')}
		>
			<Section gap="sm">
				<TextInput
					key={planDetailContext.data.form.key('pcgi_legacy.operation_plan_id')}
					label={t('operationPlanIdLabel')}
					miw="50%"
					placeholder={t('operationPlanIdPlaceholder')}
					{...planDetailContext.data.form.getInputProps('pcgi_legacy.operation_plan_id')}
					readOnly={planDetailContext.flags.isReadOnly || !canEdit}
				/>
			</Section>
		</Collapsible>
	);

	//
}
