/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterAnalysisTransactionSequentiality() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.analysis_transaction_sequentiality.isActive}
			label={t('default:list.RidesListFilterAnalysisTransactionSequentiality.label')}
			onChange={ridesListContext.filters.analysis_transaction_sequentiality.set}
			options={ridesListContext.filters.analysis_transaction_sequentiality.options}
			withToggleAll
		/>
	);

	//
}
