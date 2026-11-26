'use client';

import { GtfsValidationsDetailResultsList } from '@/components/validations/detail/GtfsValidationsDetailResultsList';
import { useValidationsDetailContext } from '@/components/validations/detail/ValidationsDetailForm.context';
import { ValidationsDetailResultsContextProvider } from '@/components/validations/detail/ValidationsDetailResults.context';
import { ValidationsDetailSelectedRule } from '@/components/validations/detail/ValidationsDetailSelectedRule';
import { Collapsible, PanesManager, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function GtfsValidationsDetailSectionResult() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const validationsDetailContext = useValidationsDetailContext();

	//
	// B. Render components

	if (validationsDetailContext.data.validation?.processing_status !== 'complete' && validationsDetailContext.data.validation?.processing_status !== 'error') return null;

	return (
		<Collapsible
			defaultOpen={true}
			description={t('gtfs_validations:detail.GtfsValidationsDetailSectionResult.description')}
			title={t('gtfs_validations:detail.GtfsValidationsDetailSectionResult.title')}
		>
			<ValidationsDetailResultsContextProvider key={validationsDetailContext.data.validation._id}>
				<Section gap="md">
					<PanesManager
						id="gtfs-validation-results"
						stackBelow={640}
						panes={[
							<GtfsValidationsDetailResultsList key="rules" />,
							<ValidationsDetailSelectedRule key="selected-rule" />,
						]}
					/>
				</Section>
			</ValidationsDetailResultsContextProvider>
		</Collapsible>
	);
}
