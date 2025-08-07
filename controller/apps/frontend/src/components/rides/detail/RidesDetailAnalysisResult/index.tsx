'use client';

/* * */

import { RidesDetailAnalysisResultItem } from '@/components/rides/detail/RidesDetailAnalysisResultItem';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { Collapsible, Grid, Label, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RidesDetailAnalysisResult() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Transform data

	const analysisItems = useMemo(() => {
		// Skip if no analysis data is available
		if (!ridesDetailContext.data.ride?.analysis) return [];
		// Transform the analysis data into an array of items
		return Object.entries(ridesDetailContext.data.ride.analysis).map(([id, item]) => ({ id, ...item }));
	}, [ridesDetailContext.data.ride?.analysis]);

	//
	// C. Render components

	return (
		<Collapsible description="Eventos dos veículos mapeados" title="Resultado das Análises">
			<Section>
				{!analysisItems.length ? (
					<Label size="lg" caps>Sem Dados</Label>
				) : (
					<Grid columns="abc" gap="md">
						{analysisItems.map(item => (
							<RidesDetailAnalysisResultItem key={item.id} grade={item.grade} id={item.id} />
						))}
					</Grid>
				)}
			</Section>
		</Collapsible>
	);

	//
}
