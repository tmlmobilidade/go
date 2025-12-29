'use client';

/* * */

import { PlanStatusTag } from '@/components/common/PlanStatusTag';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Button, Collapsible, Section, Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanDetailSectionController() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();
	const { t } = useTranslation('plans', { keyPrefix: 'detail.section_controller' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="sm">

				<PlanStatusTag status={planDetailContext.data.plan.apps?.controller?.status} />

				<Tag label={planDetailContext.data.plan.hash || 'N/A'} variant="secondary" />
				<Tag label={planDetailContext.data.plan.apps?.controller?.last_hash || 'N/A'} variant="secondary" />

				<Button
					disabled={planDetailContext.flags.isReadOnly}
					label={t('reprocess_plan_button')}
					loading={planDetailContext.flags.isSaving}
					onClick={planDetailContext.actions.controllerReprocessPlan}
				/>

			</Section>
		</Collapsible>
	);

	//
}
