'use client';

/* * */

import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';

import styles from './styles.module.css';

/* * */

interface LeftProps {
	isManual: boolean
	// long_name?: string
}

/* * */

export default function Left({ isManual }: LeftProps) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const { data: stop } = stopDetailContext;

	//
	// B. Render components

	return (
		<div className={styles.section}>
			{/* Manual -> Save Button */}
			{/* Automatic -> Close Button */}
			{isManual
				? (
					<Tooltip label="Guardar Alterações" position="bottom">
						<div className={styles.iconGreen}>
							<IconDeviceFloppy />
						</div>
					</Tooltip>
				)
				: (
					<Tooltip label="Fechar" position="bottom">
						<div className={styles.icon}>
							<IconX />
						</div>
					</Tooltip>
				)}

			{/* Label */}
			<h3>{stop.form.getValues().name || <i>Paragem sem Título</i>}</h3>
		</div>
	);
}
