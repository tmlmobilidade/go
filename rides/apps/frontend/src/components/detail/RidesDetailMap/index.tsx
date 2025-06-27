'use client';

/* * */

import { MapView } from '@/components/map/MapView';
import { MapViewGeofences } from '@/components/map/MapViewGeofences';
import { MapViewStylePath } from '@/components/map/MapViewStylePath';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { centerMap } from '@/utils/map.utils';
import { IconCrosshair, IconPlayerPlayFilled } from '@tabler/icons-react';
import { Button, Collapsible, Divider, Label, Section, SegmentedControl, Slider, Spacer, Switch } from '@tmlmobilidade/ui';
import { useMap } from '@vis.gl/react-maplibre';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export function RidesDetailMap() {
	//

	//
	// A. Setup variables

	const { ridesDetailMap } = useMap();

	const ridesDetailContext = useRidesDetailContext();

	const [isZoomEnabled, setIsZoomEnabled] = useState(true);
	const [centerMapAutomatically, setCenterMapAutomatically] = useState(true);

	const [showScheduledPath, setShowScheduledPath] = useState(true);
	const [showObservedPath, setShowObservedPath] = useState(false);
	const [showGeofences, setShowGeofences] = useState(true);

	//
	// B. Handle actions

	useEffect(() => {
		if (!centerMapAutomatically) return;
		handleCenterMap();
	}, [ridesDetailContext.geojson, centerMapAutomatically]);

	const handleCenterMap = () => {
		centerMap(
			ridesDetailMap,
			[
				...ridesDetailContext.geojson.observed_events?.features ?? [],
				...ridesDetailContext.geojson.observed_shape?.features ?? [],
				...ridesDetailContext.geojson.scheduled_path?.features ?? [],
				...ridesDetailContext.geojson.scheduled_shape?.features ?? [],
			],
			{ padding: 60 },
		);
	};

	//
	// C. Render components

	return (
		<Collapsible description="Eventos dos veículos mapeados" title="Visão Geográfica" defaultOpen>
			<div className={styles.mapWrapper}>
				<MapView id="ridesDetailMap" onDragEnd={() => setCenterMapAutomatically(false)} scrollZoom={isZoomEnabled}>
					{showScheduledPath && <MapViewStylePath shapeData={ridesDetailContext.geojson.scheduled_shape} viewId="scheduled" waypointsData={ridesDetailContext.geojson.scheduled_path} />}
					{showGeofences && <MapViewGeofences geofencesData={ridesDetailContext.geojson.scheduled_path_geofences} viewId="geofences" />}
					{showObservedPath && <MapViewStylePath shapeData={ridesDetailContext.geojson.observed_shape} viewId="observed" waypointsData={ridesDetailContext.geojson.observed_events} />}
				</MapView>
			</div>
			<Section alignItems="center" flexDirection="row" gap="md">
				<Switch checked={showScheduledPath} label="Percurso Planeado" onChange={() => setShowScheduledPath(prev => !prev)} />
				<Switch checked={showObservedPath} label="Percurso Observado" onChange={() => setShowObservedPath(prev => !prev)} />
				<Switch checked={showGeofences} label="Geofences" onChange={() => setShowGeofences(prev => !prev)} />
				<Spacer />
				<Switch checked={isZoomEnabled} label="Permitir Zoom" onChange={() => setIsZoomEnabled(prev => !prev)} />
				<Button icon={<IconCrosshair />} label="Centrar" onClick={handleCenterMap} />
				<SegmentedControl data={[{ label: 'Mapa', value: 'map' }, { label: 'Satélite', value: 'satelite' }]} />
			</Section>
			<Divider />
			<Section alignItems="center" flexDirection="row" gap="md">
				<Button icon={<IconPlayerPlayFilled />} label="Play" />
				<Slider />
				<Label size="sm" caps singleLine>Ordenar eventos por</Label>
				<SegmentedControl
					value="created_at"
					data={[
						{ label: 'Receção', value: 'received_at' },
						{ label: 'Operador', value: 'updated_at' },
						{ label: 'Veículo', value: 'created_at' },
					]}
				/>
			</Section>
		</Collapsible>
	);

	//
}
