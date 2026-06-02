'use client';

import { useTransitModes } from '@/hooks/use-transit-modes';
import { IconBuildingTunnel, IconBus, IconFerry, IconTrain } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function TransitModesBar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeTransitModes, availableTransitModes, toggleTransitMode } = useTransitModes();

	//
	// B. Render components

	return (
		<div className={styles.bar}>
			{availableTransitModes.map(mode => (
				<div
					key={mode}
					aria-checked={activeTransitModes.includes(mode)}
					aria-label={t(`default:viewport.TransitModesBar.aria_label.${mode}`)}
					className={styles.button}
					data-active={activeTransitModes.includes(mode)}
					onClick={() => toggleTransitMode(mode)}
					role="checkbox"
				>
					{mode === 'bus' && <IconBus size={24} />}
					{mode === 'subway' && <IconBuildingTunnel size={24} />}
					{mode === 'train' && <IconTrain size={24} />}
					{mode === 'ferry' && <IconFerry size={24} />}
				</div>
			))}
		</div>
	);
}
