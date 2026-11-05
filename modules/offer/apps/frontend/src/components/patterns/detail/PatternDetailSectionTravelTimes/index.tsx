/* * */

import { Collapsible, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { ParametersListView } from '../../shape/parameters/list/ParametersListView';

/* * */

export function PatternDetailSectionTravelTimes() {
	//

	//
	// A. Render components

	const { t } = useTranslation();
	return (
		<Collapsible description={t('patterns:detail.PatternDetailSectionTravelTimes.travel_times_hint')} title={t('patterns:detail.PatternDetailSectionTravelTimes.travel_times')}>
			<Section>
				<ParametersListView />
			</Section>
		</Collapsible>
	);

	//
}
