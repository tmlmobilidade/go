'use client';

import { ActionIcon } from '@mantine/core';
import { IconMapPinFilled } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

// interface RightProps {
// 	setToggleValue: (value?: SetStateAction<'Mapa' | 'Satélite'>) => void
// 	toggleValue: 'Mapa' | 'Satélite'
// }

/* * */

export function Right() {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			{/* Patterns Butoon */}
			{/* <Button className={styles.button} onClick={() => setToggleValue()}>
				{toggleValue}
			</Button> */}

			{/* Stop Button */}
			<Link href="https://www.google.com/maps/@38.6512317,-8.8813723,10z" target="_blank">
				<Tooltip label="Open in Google Maps" position="bottom">
					<ActionIcon
						className={styles.icon}
						variant="secondary"
					// onClick={() => window.open(`https://www.google.com/maps/@38.6512317,-8.8813723,10z`, '_blank')}
					>
						<IconMapPinFilled />
					</ActionIcon>
				</Tooltip>
			</Link>

			{/* Save Button */}
			{/* <Link href={Routes.STOP_DETAIL('new')}>
				<Tooltip label="Criar Paragem" position="bottom">
					<ActionIcon
						className={styles.icon}
						variant="primary"
					>
						<IconPlus />
					</ActionIcon>
				</Tooltip>
			</Link> */}
		</div>
	);
}
