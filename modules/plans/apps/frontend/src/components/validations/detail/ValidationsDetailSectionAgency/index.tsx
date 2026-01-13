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
	const { t } = useTranslation();

	//
	// B. Render components

	if (!validationsDetailContext.data.validation?.gtfs_agency) {
		return null;
	}

	return (
		<Collapsible
			description={t('plans:validations.detail.ValidationsDetailSectionAgency.description')}
			title={t('plans:validations.detail.ValidationsDetailSectionAgency.title')}
		>
			<Section gap="sm">
				<AgencyDisplay data={validationsDetailContext.data.validation.gtfs_agency} />
			</Section>
		</Collapsible>
	);

	//
}
