/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterAnalysisTransactionSequentiality } from './use-rides-list-filter-analysis-transaction-sequentiality';

/* * */

export function RidesListFilterAnalysisTransactionSequentiality() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAnalysisTransactionSequentiality = useRidesListFilterAnalysisTransactionSequentiality();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAnalysisTransactionSequentiality.isActive}
			label={t('default:list.RidesListFilterAnalysisTransactionSequentiality.label')}
			onChange={filterAnalysisTransactionSequentiality.set}
			options={filterAnalysisTransactionSequentiality.options}
			withToggleAll
		/>
	);
}
