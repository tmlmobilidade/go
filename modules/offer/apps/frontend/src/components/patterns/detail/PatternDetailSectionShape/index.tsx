/* * */

import StatCard from '@/components/common/StatCard';
import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { ShapeEditorModal } from '@/components/patterns/shape/shape-editor/ShapeEditor.modal';
import { IconFileZip, IconShape } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Agency } from '@tmlmobilidade/types';
import { Button, Collapsible, Grid, MapOverlayPatternShape, MapView, Section } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export function PatternDetailSectionShape() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
	const { data: agencyData } = useSWR<Agency, Error>(API_ROUTES.auth.AGENCIES_DETAIL(patternDetailContext.data.agency_id || ''));

	const [isEditorOpen, setIsEditorOpen] = useState(false);

	//
	// B. Transform data

	const shapeExtensionCardValue = useMemo(() => {
		if (!patternDetailContext.data.form.values?.shape?.extension) return null;
		if (patternDetailContext.data.form.values?.shape?.extension > 1000) return `${(patternDetailContext.data.form.values.shape.extension / 1000).toFixed(3)} km`;
		else return `${patternDetailContext.data.form.values.shape.extension} m`;
	}, [patternDetailContext.data.form.values]);

	const shapeCost = useMemo(() => {
		if (!patternDetailContext.data.form.values?.shape?.extension || !agencyData?.financials) return null;
		const shapeExtensionInKm = patternDetailContext.data.form.values?.shape?.extension / 1000;
		const shapeCostRaw = shapeExtensionInKm * agencyData.financials.price_per_km;
		return `${shapeCostRaw.toFixed(2)} €`;
	}, [agencyData, patternDetailContext.data.form.values]);

	//
	// C. Render components

	return (
		<Collapsible title="Sequência de paragens" defaultOpen>
			{(shapeExtensionCardValue !== null || shapeCost !== null) && (
				<Section gap="sm">
					<Grid columns="abc" gap="sm">
						<StatCard title="Extensão" value={shapeExtensionCardValue} />
						<StatCard title="Custo de cada viagem" value={shapeCost} />
					</Grid>
				</Section>
			)}

			<Section gap="md" height="100%" padding="none" width="100%">

				<MapView height={500} id="shapeMapView">
					<MapOverlayPatternShape
						id="pattern-shape"
						lineColor={patternDetailContext.data.typologyData?.color || undefined}
						lineData={patternDetailContext.geojson.pattern_line}
						stopsData={patternDetailContext.geojson.pattern_stops}
					/>
				</MapView>

				<Section flexDirection="row" gap="sm">
					<Button
						label="Editar percurso"
						leftSection={<IconShape />}
						onClick={() => setIsEditorOpen(true)}
					/>
					<Button
						label="Importar ficheiro GTFS"
						leftSection={<IconFileZip />}
						onClick={() => setIsEditorOpen(true)}
						variant="secondary"
					/>
				</Section>

				{/* SHAPE EDITOR MODAL */}
				<ShapeEditorModal onClose={() => setIsEditorOpen(false)} opened={isEditorOpen} />
			</Section>

		</Collapsible>
	);

	//
}
