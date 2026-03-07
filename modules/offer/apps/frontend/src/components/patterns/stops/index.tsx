/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { Section, SegmentedControl, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';

import { ParametersListView } from './parameters/list/ParametersListView';
import { StopsTable } from './table/StopsTable';

/* * */

export function Stops() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
	const [activeView, setActiveView] = useState<'parameters' | 'stops'>('stops');

	//
	// B. Render components

	if (!patternDetailContext.data.pattern?.path?.length) {
		return (
			<Section>
				<Text>Nenhuma paragem associada a este pattern.</Text>
			</Section>
		);
	}

	return (
		<Section gap="lg">
			{/* View selection */}
			<SegmentedControl
				onChange={value => setActiveView(value as 'parameters' | 'stops')}
				value={activeView}
				data={[
					{ label: 'Paragens', value: 'stops' },
					{ label: 'Parâmetros Operacionais', value: 'parameters' },
				]}
			/>

			{/* Conditional Views */}
			{activeView === 'stops' && <StopsTable />}
			{activeView === 'parameters' && <ParametersListView />}

		</Section>
	);

	//
}
