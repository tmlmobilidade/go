'use client';

import { SegmentedControl, Switch } from '@mantine/core';
import { IconCrosshair } from '@tabler/icons-react';

import { Button } from '../../../../buttons';
import { useMapContext } from '../../../../contexts/Map.context';
import { SearchField } from '../../../../filters';
import { Toolbar } from '../../../../layout';
import { Spacer } from '../../../layout/Spacer';
import { MAP_STYLES } from '../../configs/styles';
import { useMapViewContext } from '../MapViewContext';

/* * */

interface MapViewToolbarProps {
	onScrollZoomChange?: (value: boolean) => void
	scrollZoom?: boolean
}

/* * */

export function MapViewToolbar({ onScrollZoomChange, scrollZoom }: MapViewToolbarProps) {
	//

	//
	// A. Setup variables

	const mapContext = useMapContext();
	const mapViewContext = useMapViewContext();
	const isScrollZoomEnabled = scrollZoom ?? mapContext.flags.scroll_zoom;

	//
	// B. Transform data

	const mapStyleOptions = Object
		.entries(MAP_STYLES)
		.map(([key, style]) => ({ label: style.label, value: key }));

	//
	// C. Handle actions

	const handleToggleScrollZoom = () => {
		if (onScrollZoomChange) {
			onScrollZoomChange(!isScrollZoomEnabled);
			return;
		}
		mapContext.actions.toggleScrollZoom();
	};

	//
	// D. Render components

	return (
		<Toolbar>
			<Switch checked={isScrollZoomEnabled} label="Permitir Zoom" onChange={handleToggleScrollZoom} />
			<Switch checked={mapViewContext.flags.auto_zoom} label="Auto Zoom" onChange={() => mapViewContext.actions.toggleAutoZoom()} />
			<Spacer />
			<SearchField onChange={mapContext.actions.handleSearch} value={mapContext.data.search} />
			<Button icon={<IconCrosshair />} label="Centrar" loading={mapViewContext.flags.loading} onClick={() => mapViewContext.actions.toggleAutoZoom(true)} />
			<SegmentedControl data={mapStyleOptions} onChange={() => mapContext.actions.toggleStyle()} value={mapContext.flags.style} />
		</Toolbar>
	);

	//
}
