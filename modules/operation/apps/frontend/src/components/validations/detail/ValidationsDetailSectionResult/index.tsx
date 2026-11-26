'use client';

import { useValidationsDetailContext } from '@/components/validations/detail/ValidationsDetailForm.context';
import { ValidationsDetailResultsContextProvider } from '@/components/validations/detail/ValidationsDetailResults.context';
import { ValidationsDetailResultsFilters } from '@/components/validations/detail/ValidationsDetailResultsFilters';
import { ValidationsDetailResultsList } from '@/components/validations/detail/ValidationsDetailResultsList';
import { ValidationsDetailSelectedRule } from '@/components/validations/detail/ValidationsDetailSelectedRule';
import { Collapsible, PanesManager, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailSectionResult() {
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
			description={t('validations:detail.ValidationsDetailSectionResult.description')}
			title={t('validations:detail.ValidationsDetailSectionResult.title')}
		>
			<ValidationsDetailResultsContextProvider key={validationsDetailContext.data.validation._id}>
				<Section gap="md">
					<ValidationsDetailResultsFilters />
					<PanesManager
						id="validation-results"
						stackBelow={640}
						panes={[
							<ValidationsDetailResultsList key="rules" />,
							<ValidationsDetailSelectedRule key="selected-rule" />,
						]}
					/>
				</Section>
			</ValidationsDetailResultsContextProvider>
		</Collapsible>
	);
}
