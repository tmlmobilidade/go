/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Collapsible, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansDetailSectionAgency() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();
	const { t } = useTranslation('plans', { keyPrefix: 'plans.detail.section_agency' });

	//
	// B. Render components

	if (!plansDetailContext.data.plan?.gtfs_agency) {
		return null;
	}

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="sm">
				<AgencyDisplay data={plansDetailContext.data.plan.gtfs_agency} />
			</Section>
		</Collapsible>
	);

	//
}
