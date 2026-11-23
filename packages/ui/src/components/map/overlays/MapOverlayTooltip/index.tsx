'use client';

import { Popup } from '@vis.gl/react-maplibre';

import styles from './styles.module.css';

import { Label } from '../../../display';
import { Section, Surface } from '../../../layout';

interface MapOverlayTooltipProps {
	label: string
	latitude: number
	longitude: number
}

export function MapOverlayTooltip({ label, latitude, longitude }: MapOverlayTooltipProps) {
	return (
		<Popup anchor="bottom" className={styles.popup} closeButton={false} closeOnClick={false} focusAfterOpen={false} latitude={latitude} longitude={longitude} maxWidth="300px" offset={12}>
			<Surface elevated>
				<Section gap="xs">
					<Label>{label}</Label>
				</Section>
			</Surface>
		</Popup>
	);
}
