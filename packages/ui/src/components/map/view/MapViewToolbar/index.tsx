'use client';

/* * */

import { Button } from '@/components/buttons';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Switch } from '@/components/common/Switch';
import { SearchInput } from '@/components/inputs';
import { Spacer } from '@/components/layout/Spacer';
import { Toolbar } from '@/components/layout/Toolbar';
import { MAP_STYLES } from '@/components/map/configs/styles';
import { useMapViewContext } from '@/components/map/view/MapViewContext';
import { useMapContext } from '@/contexts';
import { IconCrosshair } from '@tabler/icons-react';
import { useMemo } from 'react';

/* * */

export function MapViewToolbar() {
	//

	//
	// A. Setup variables

	const mapContext = useMapContext();
	const mapViewContext = useMapViewContext();

	//
	// B. Transform data

	const mapStyleOptions = useMemo(() => {
		return Object
			.entries(MAP_STYLES)
			.map(([key, style]) => ({ label: style.label, value: key }));
	}, [MAP_STYLES]);

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
