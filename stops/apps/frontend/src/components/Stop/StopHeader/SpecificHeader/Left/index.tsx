'use client';

/* * */

import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';

import styles from './styles.module.css';

/* * */

interface LeftProps {
	// long_name?: string
	data: unknown
	isManual: boolean
}

/* * */

export default function Left({ data, isManual }: LeftProps) {
	//
	// B. Render components

	return (
		<div className={styles.section}>
			{/* Manual -> Save Button */}
			{/* Automatic -> Close Button */}
			{/* {isManual
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
				)} */}

			{/* Label */}
			<h3>{data.form.getValues().name || <i>Paragem sem Título</i>}</h3>
		</div>
	);
}
