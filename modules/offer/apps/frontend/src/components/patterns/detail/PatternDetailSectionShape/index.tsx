/* * */

import StatCard from '@/components/common/StatCard';
import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { ShapeEditorModal } from '@/components/patterns/stops/ShapeEditor.modal';
import { IconBrandSpeedtest, IconShape } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Agency } from '@tmlmobilidade/types';
import { Button, Collapsible, Grid, MapOverlayPatternShape, MapView, Section } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

// import { openShapeEditorModal } from '../../stops/ShapeEditor.modal';

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

	const travelTime = useMemo(() => {
		if (!patternDetailContext.data.stopsParameterRules) return null;
		const defaultRule = patternDetailContext.data.stopsParameterRules.find(r => r.kind === 'default');
		return `${defaultRule?.travelTimes.totalTripSecondsWithStops.formatted || 0}`;
	}, [patternDetailContext.data.stopsParameterRules]);

	//
	// C. Render components

	return (
		<Collapsible title="Percurso" defaultOpen>
			<Section gap="sm">
				<Grid columns="abc" gap="sm">
					<StatCard title="Extensão" value={shapeExtensionCardValue} />
					<StatCard title="Tempo de execução" value={travelTime} />
					<StatCard title="Custo de cada viagem" value={shapeCost} />
				</Grid>
			</Section>

			<Section flexDirection="row" gap="md">
				<Button
					label="Atualizar percurso"
					leftSection={<IconShape />}
					onClick={() => setIsEditorOpen(true)}
				/>
				<Button label="Editar parâmetros" leftSection={<IconBrandSpeedtest />} variant="secondary" />
			</Section>

			<ShapeEditorModal onClose={() => setIsEditorOpen(false)} opened={isEditorOpen} />

			<div className={styles.mapWrapper}>
				<MapView id="shapeMapView">
					<MapOverlayPatternShape
						id="pattern-shape"
						lineColor={patternDetailContext.data.typologyData?.color || undefined}
						lineData={patternDetailContext.geojson.pattern_line}
						stopsData={patternDetailContext.geojson.pattern_stops}
					/>
				</MapView>
			</div>

		</Collapsible>
	);

	//
}
