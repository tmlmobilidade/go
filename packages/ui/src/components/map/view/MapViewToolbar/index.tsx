'use client';

/* * */

import { SegmentedControl, Switch } from '@mantine/core';
import { IconCrosshair } from '@tabler/icons-react';

import { useMapContext } from '../../../../contexts/Map.context';
import { Button } from '../../../buttons/Button';
import { SearchInput } from '../../../inputs/SearchInput';
import { Spacer } from '../../../layout/Spacer';
import { Toolbar } from '../../../layout/Toolbar';
import { MAP_STYLES } from '../../configs/styles';
import { useMapViewContext } from '../MapViewContext';

/* * */

export function MapViewToolbar() {
	//

	//
	// A. Setup variables

	const mapContext = useMapContext();
	const mapViewContext = useMapViewContext();

	//
	// B. Transform data

	const mapStyleOptions = Object
		.entries(MAP_STYLES)
		.map(([key, style]) => ({ label: style.label, value: key }));

	//
	// C. Render components

	return (
		<Toolbar>
			<Switch checked={mapContext.flags.scroll_zoom} label="Permitir Zoom" onChange={() => mapContext.actions.toggleScrollZoom()} />
			<Switch checked={mapViewContext.flags.auto_zoom} label="Auto Zoom" onChange={() => mapViewContext.actions.toggleAutoZoom()} />
			<Spacer />
			<SearchInput onChange={mapContext.actions.handleSearch} value={mapContext.data.search} />
			<Button icon={<IconCrosshair />} label="Centrar" loading={mapViewContext.flags.loading} onClick={() => mapViewContext.actions.toggleAutoZoom(true)} />
			<SegmentedControl data={mapStyleOptions} onChange={() => mapContext.actions.toggleStyle()} value={mapContext.flags.style} />
		</Toolbar>
	);

	//
}
