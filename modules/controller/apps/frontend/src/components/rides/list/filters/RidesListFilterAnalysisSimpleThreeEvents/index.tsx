/* * */

import { ListFilter } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterAnalysisSimpleThreeEvents } from './use-rides-list-filter-analysis-simple-three-events';

/* * */

export function RidesListFilterAnalysisSimpleThreeEvents() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAnalysisSimpleThreeEvents = useRidesListFilterAnalysisSimpleThreeEvents();

	//
	// B. Render components

	return (
		<ListFilter
			active={filterAnalysisSimpleThreeEvents.isActive}
			label={t('default:list.RidesListFilterAnalysisSimpleThreeEvents.label')}
			onChange={filterAnalysisSimpleThreeEvents.set}
			options={filterAnalysisSimpleThreeEvents.options}
			withToggleAll
		/>
	);
}
