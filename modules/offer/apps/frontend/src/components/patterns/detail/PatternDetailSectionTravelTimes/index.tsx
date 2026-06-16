/* * */

import { Collapsible, Section } from '@tmlmobilidade/ui';

import { ParametersListView } from '../../shape/parameters/list/ParametersListView';

/* * */

export function PatternDetailSectionTravelTimes() {
	//

	//
	// A. Render components

	return (
		<Collapsible description="Define a duração entre paragens e o tempo de paragem para cada tipo de viagem." title="Tempos de viagem">
			<Section>
				<ParametersListView />
			</Section>
		</Collapsible>
	);

	//
}
