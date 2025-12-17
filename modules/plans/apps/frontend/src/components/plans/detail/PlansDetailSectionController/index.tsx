'use client';

/* * */

import { PlanStatusTag } from '@/components/common/PlanStatusTag';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Button, Collapsible, Section, Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansDetailSectionController() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();
	const { t } = useTranslation('plans', { keyPrefix: 'plans.detail.section_controller' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="sm">

				<PlanStatusTag status={plansDetailContext.data.plan.apps?.controller?.status} />

				<Tag label={plansDetailContext.data.plan.hash || 'N/A'} variant="secondary" />
				<Tag label={plansDetailContext.data.plan.apps?.controller?.last_hash || 'N/A'} variant="secondary" />

				<Button
					disabled={plansDetailContext.flags.read_only}
					label={t('reprocess_plan_button')}
					loading={plansDetailContext.flags.saving}
					onClick={plansDetailContext.actions.controllerReprocessPlan}
				/>

			</Section>
		</Collapsible>
	);

	//
}
