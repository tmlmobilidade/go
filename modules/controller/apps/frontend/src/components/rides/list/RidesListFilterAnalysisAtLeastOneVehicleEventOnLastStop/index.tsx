/* * */

import { FilterTypeList } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from './use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';

/* * */

export function RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const filterAnalysisAtLeastOneVehicleEventOnLastStop = useRidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop();

	//
	// B. Render components

	return (
		<FilterTypeList
			active={filterAnalysisAtLeastOneVehicleEventOnLastStop.isActive}
			label={t('default:list.RidesListFilterAnalysisAtLeastOneVehicleEventOnLastStop.label')}
			onChange={filterAnalysisAtLeastOneVehicleEventOnLastStop.set}
			options={filterAnalysisAtLeastOneVehicleEventOnLastStop.options}
			withToggleAll
		/>
	);
}
