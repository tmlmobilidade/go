/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Collapsible, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanDetailSectionAgency() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();
	const { t } = useTranslation('plans', { keyPrefix: 'plans.detail.section_agency' });

	//
	// B. Render components

	if (!planDetailContext.data.plan?.gtfs_agency) {
		return null;
	}

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="sm">
				<AgencyDisplay data={planDetailContext.data.plan.gtfs_agency} />
			</Section>
		</Collapsible>
	);

	//
}
