'use client';

import { useValidationsDetailContext } from '@/components/validations/detail/ValidationsDetailForm.context';
import { ValidationsDetailResultsContextProvider } from '@/components/validations/detail/ValidationsDetailResults.context';
import { ValidationsDetailResultsFilters } from '@/components/validations/detail/ValidationsDetailResultsFilters';
import { ValidationsDetailResultsList } from '@/components/validations/detail/ValidationsDetailResultsList';
import { ValidationsDetailSelectedRule } from '@/components/validations/detail/ValidationsDetailSelectedRule';
import { Collapsible, PanesManager } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function ValidationsDetailSectionResult() {
	//

	//
	// A. Setup variables

	const { data: { validation } } = useValidationsDetailContext();
	const { t } = useTranslation();

	//
	// B. Render components

	if (validation?.processing_status !== 'complete' && validation?.processing_status !== 'error') return null;

	return (
		<Collapsible
			defaultOpen={true}
			description={t('validations:detail.ValidationsDetailSectionResult.description')}
			title={t('validations:detail.ValidationsDetailSectionResult.title')}
		>
			<ValidationsDetailResultsContextProvider key={validation._id}>
				<div className={styles.results}>
					<ValidationsDetailResultsFilters />
					<div className={styles.panes}>
						<PanesManager
							id="validation-results"
							stackBelow={640}
							panes={[
								<ValidationsDetailResultsList key="rules" />,
								<ValidationsDetailSelectedRule key="selected-rule" />,
							]}
						/>
					</div>
				</div>
			</ValidationsDetailResultsContextProvider>
		</Collapsible>
	);

	//
}
