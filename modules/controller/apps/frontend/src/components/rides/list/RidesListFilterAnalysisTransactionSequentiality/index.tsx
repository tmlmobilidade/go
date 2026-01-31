/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function RidesListFilterAnalysisTransactionSequentiality() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={ridesListContext.filters.analysis_transaction_sequentiality.isActive}
			label="Sequencialidade APEX"
			onChange={ridesListContext.filters.analysis_transaction_sequentiality.set}
			options={ridesListContext.filters.analysis_transaction_sequentiality.options}
			withToggleAll
		/>
	);

	//
}
