/* * */

import StatCard from '@/components/common/StatCard';
import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Agency } from '@tmlmobilidade/types';
import { Collapsible, Grid, MapOverlayPatternShape, MapView, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function PatternDetailSectionShape() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
	const { data: agencyData } = useSWR<Agency, Error>(API_ROUTES.auth.AGENCIES_DETAIL(patternDetailContext.data.agency_id || ''));

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
		<Collapsible title="Shape">
			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<StatCard title="Extensão" value={shapeExtensionCardValue} />
					<StatCard title="Custo de cada viagem" value={shapeCost} />
				</Grid>

			</Section>

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
