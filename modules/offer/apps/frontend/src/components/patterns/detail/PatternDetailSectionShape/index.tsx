/* * */

import StatCard from '@/components/common/StatCard';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { openGtfsImportModal } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsImport.modal';
import { ShapeEditorModal } from '@/components/patterns/shape/shape-editor/ShapeEditor.modal';
import { IconFileZip, IconShape } from '@tabler/icons-react';
import { type PatternsDetail } from '@tmlmobilidade/go-offer-pckg-types';
import { Button, Collapsible, Grid, MapOverlayPatternShape, MapView, Section, useToast } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function PatternDetailSectionShape() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const linesListContext = useLinesListContext();
	const patternDetailContext = usePatternDetailContext();

	const [isEditorOpen, setIsEditorOpen] = useState(false);

	//
	// B. Transform data

	const shapeExtensionCardValue = useMemo(() => {
		if (!patternDetailContext.data.shape?.extension) return null;
		if (patternDetailContext.data.shape?.extension > 1000) return `${(patternDetailContext.data.shape.extension / 1000).toFixed(3)} km`;
		else return `${patternDetailContext.data.shape.extension} m`;
	}, [patternDetailContext.data]);

	const agencyData = useMemo(() => {
		return linesListContext.data.agencies.find(agency => agency._id === patternDetailContext.data.agency_id);
	}, [linesListContext.data.agencies, patternDetailContext.data.agency_id]);

	const shapeCost = useMemo(() => {
		if (!patternDetailContext.data.shape?.extension || !agencyData?.financials) return null;
		const shapeExtensionInKm = patternDetailContext.data.shape?.extension / 1000;
		const shapeCostRaw = shapeExtensionInKm * agencyData.financials.price_per_km;
		return `${shapeCostRaw.toFixed(2)} €`;
	}, [agencyData, patternDetailContext.data]);

	//
	// C. Handle actions

	const handleLoadPattern = (pattern: PatternsDetail) => {
		if (!patternDetailContext.capabilities.editEnabled) return;
		patternDetailContext.actions.applyChanges({ parameters: pattern.parameters, path: pattern.path, shape: pattern.shape });
		useToast.info({ message: t('patterns:detail.PatternDetailSectionShape.pattern_loaded') });
	};

	const handleOpenGtfsImportModal = () => {
		if (!patternDetailContext.capabilities.editEnabled) return;
		openGtfsImportModal({
			currentShapeExtension: patternDetailContext.data.pattern?.shape?.extension || 0,
			currentStopCount: patternDetailContext.data.pattern?.path?.length || 0,
			onLoad: handleLoadPattern,
			patternId: patternDetailContext.data.id,
		});
	};

	const handleOpenEditor = () => {
		if (!patternDetailContext.capabilities.editEnabled) return;
		setIsEditorOpen(true);
	};

	useEffect(() => {
		if (!patternDetailContext.capabilities.editEnabled) setIsEditorOpen(false);
	}, [patternDetailContext.capabilities.editEnabled]);

	//
	// D. Render components

	return (
		<Collapsible title={t('patterns:detail.PatternDetailSectionShape.stop_sequence')} defaultOpen>
			{(shapeExtensionCardValue !== null || shapeCost !== null) && (
				<Section gap="sm">
					<Grid columns="ab" gap="sm">
						<StatCard title={t('patterns:detail.PatternDetailSectionShape.length')} value={shapeExtensionCardValue} />
						<StatCard title={t('patterns:detail.PatternDetailSectionShape.trip_cost')} value={shapeCost} />
					</Grid>
				</Section>
			)}

			<Section gap="md" height="100%" padding="none" width="100%">

				<MapView key={patternDetailContext.data.id} defaultScrollZoom={false} height={500} id="shapeMapView">
					<MapOverlayPatternShape
						id="pattern-shape"
						lineColor={patternDetailContext.data.typologyData?.color || undefined}
						lineData={patternDetailContext.geojson.pattern_line}
						stopsData={patternDetailContext.geojson.pattern_stops}
					/>
				</MapView>

				<Section flexDirection="row" gap="sm">
					<Button
						disabled={!patternDetailContext.capabilities.editEnabled}
						label={t('patterns:detail.PatternDetailSectionShape.edit_pattern')}
						leftSection={<IconShape />}
						onClick={handleOpenEditor}
					/>
					<Button
						disabled={!patternDetailContext.capabilities.editEnabled}
						label={t('patterns:detail.PatternDetailSectionShape.import_gtfs')}
						leftSection={<IconFileZip />}
						onClick={handleOpenGtfsImportModal}
						variant="secondary"
					/>
				</Section>

				{/* SHAPE EDITOR MODAL */}
				{patternDetailContext.capabilities.editEnabled && <ShapeEditorModal onClose={() => setIsEditorOpen(false)} opened={isEditorOpen} />}
			</Section>

		</Collapsible>
	);

	//
}
