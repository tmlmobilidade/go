'use client';

/* * */

import { Button } from '@mantine/core';
import { IconMapPinFilled } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';
import { SetStateAction } from 'react';

/* * */

import styles from './styles.module.css';

/* * */

interface RightProps {
	setToggleValue: (value?: SetStateAction<'Mapa' | 'Satélite'>) => void
	toggleValue: 'Mapa' | 'Satélite'
}

/* * */

export default function Right({ setToggleValue, toggleValue }: RightProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			{/* Patterns Butoon */}
			<Button className={styles.button} onClick={() => setToggleValue()}>
				{toggleValue}
			</Button>

			{/* Stop Button */}
			<Tooltip label="Open in Google Maps" position="bottom">
				<div
					className={styles.icon}
					onClick={() => window.open(`https://www.google.com/maps/@38.6512317,-8.8813723,10z`, '_blank')}
				>
					<IconMapPinFilled />
				</div>
			</Tooltip>
		</div>
	);
}
