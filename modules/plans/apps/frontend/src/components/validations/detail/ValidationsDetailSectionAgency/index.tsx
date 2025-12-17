/* * */

import { AgencyDisplay } from '@/components/common/AgencyDisplay';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { Collapsible, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailSectionAgency() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();
	const { t } = useTranslation('plans', { keyPrefix: 'validations.detail.section_agency' });

	//
	// B. Render components

	if (!validationsDetailContext.data.validation?.gtfs_agency) {
		return null;
	}

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="sm">
				<AgencyDisplay data={validationsDetailContext.data.validation.gtfs_agency} />
			</Section>
		</Collapsible>
	);

	//
}
