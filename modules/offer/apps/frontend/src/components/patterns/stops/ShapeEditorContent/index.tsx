/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { MapOverlayPatternShape, MapView, Section, Text, useToast } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { useStopsEditorContext } from '../ShapeEditor.context';
import { StopsList } from '../ShapeEditorStopsList';

/* * */

export function ShapeEditorContent() {
	const patternDetailContext = usePatternDetailContext();
	const stopsEditorContext = useStopsEditorContext();

	const lineData = useMemo(() => {
		if (stopsEditorContext.data.routeData?.legs?.length) {
			return {
				features: stopsEditorContext.data.routeData.legs.map(leg => ({
					geometry: {
						coordinates: leg.geometry,
						type: 'LineString' as const,
					},
					properties: {
						color: patternDetailContext.data.typologyData?.color,
						from_index: leg.from_index,
						id: `${patternDetailContext.data.id}:${leg.from_index}-${leg.to_index}`,
						to_index: leg.to_index,
					},
					type: 'Feature' as const,
				})),
				type: 'FeatureCollection' as const,
			};
		}

		return patternDetailContext.geojson.pattern_line;
	}, [
		patternDetailContext.data.id,
		patternDetailContext.data.typologyData?.color,
		patternDetailContext.geojson.pattern_line,
		stopsEditorContext.data.routeData,
	]);

	const handleAnchorDrop = async (anchor: {
		lat: number
		lon: number
		segment?: {
			from_index: number
			to_index: number
		}
	}) => {
		if (!anchor.segment) {
			useToast.error({
				message: 'Este shape ainda não está preparado para desvios. Recalcule primeiro o percurso.',
				title: 'Não foi possível adicionar desvio',
			});
			return;
		}

		const afterPathItem = stopsEditorContext.data.path[anchor.segment.from_index];
		const beforePathItem = stopsEditorContext.data.path[anchor.segment.to_index];

		if (!afterPathItem || !beforePathItem) {
			useToast.error({
				message: 'Não foi possível identificar o segmento entre paragens.',
				title: 'Erro ao adicionar desvio',
			});
			return;
		}

		await stopsEditorContext.actions.addShapeAnchor({
			after_stop_id: afterPathItem.stop_id,
			before_stop_id: beforePathItem.stop_id,
			lat: anchor.lat,
			lon: anchor.lon,
			type: 'via',
		});
	};

	if (!patternDetailContext.data.pattern?.path?.length) {
		return (
			<Section>
				<Text>Nenhuma paragem associada a este pattern.</Text>
			</Section>
		);
	}

	return (
		<div className={styles.container}>
			<Section width="40%">
				<StopsList />
			</Section>

			{/* <IconButton
				icon={<IconRoute />}
				onClick={() => void stopsEditorContext.actions.convertShapeToEditable()}
				tooltip="Recalcular percurso"
			/> */}

			<div className={styles.mapWrapper}>
				<MapView id="shapeMapView">
					<MapOverlayPatternShape
						enableAnchorPreview={stopsEditorContext.flags.isEditableShape}
						id="pattern-shape"
						lineColor={patternDetailContext.data.typologyData?.color || undefined}
						lineData={lineData}
						onAnchorDrop={handleAnchorDrop}
						stopsData={patternDetailContext.geojson.pattern_stops}
					/>
				</MapView>
			</div>
		</div>
	);
}
