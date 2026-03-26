/* * */

/* * */

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
import { FilterTarget } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RidesListFilterPins() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const ridesListContext = useRidesListContext();

	//
	// B. Render components

	return (
		<FilterTarget
			active={ridesListContext.flags.pinsEnabled}
			disabled={ridesListContext.flags.loading}
			label={t('default:list.RidesList.columns.pins.label')}
			onClick={() => {
				ridesListContext.actions.setPinsEnabled();
			}}
		/>
	);
}
