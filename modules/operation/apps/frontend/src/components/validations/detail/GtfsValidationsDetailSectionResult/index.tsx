'use client';

import { Collapsible, PanesManager, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { GtfsValidationsDetailResultsContextProvider } from '../GtfsValidationsDetailResults.context';
import { GtfsValidationsDetailResultsList } from '../GtfsValidationsDetailResultsList';
import { GtfsValidationsDetailSelectedRule } from '../GtfsValidationsDetailSelectedRule';
import { useValidationsDetailContext } from '../ValidationsDetailForm.context';

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
			<GtfsValidationsDetailResultsContextProvider key={validationsDetailContext.data.validation._id}>
				<Section gap="md" maxHeight={600}>
					<PanesManager
						id="gtfs-validation-results"
						stackBelow={640}
						panes={[
							<GtfsValidationsDetailResultsList key="rules" />,
							<GtfsValidationsDetailSelectedRule key="selected-rule" />,
						]}
					/>
				</Section>
			</GtfsValidationsDetailResultsContextProvider>
		</Collapsible>
	);
}
