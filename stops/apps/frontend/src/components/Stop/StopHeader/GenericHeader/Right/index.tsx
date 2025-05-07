'use client';

/* * */

import { ActionIcon, Button } from '@mantine/core';
import { IconDeviceFloppy, IconMapPinFilled, IconPlus } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';
import { SetStateAction } from 'react';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Routes } from '@/lib/routes';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';

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
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const { actions } = stopDetailContext;

	//
	// B. Render components

	return (
		<div className={styles.section}>
			{/* Patterns Butoon */}
			<Button className={styles.button} onClick={() => setToggleValue()}>
				{toggleValue}
			</Button>

			{/* Stop Button */}
			<Link href="https://www.google.com/maps/@38.6512317,-8.8813723,10z">
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
			<Link href={Routes.STOP_DETAIL('new')}>
				<Tooltip label="Criar Paragem" position="bottom">
					<ActionIcon
						className={styles.icon}
						variant="primary"
					>
						<IconPlus />
					</ActionIcon>
				</Tooltip>
			</Link>
		</div>
	);
}
