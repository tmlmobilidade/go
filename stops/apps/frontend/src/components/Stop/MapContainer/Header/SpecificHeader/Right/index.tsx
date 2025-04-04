'use client';

import { IconEye, IconWorldUpload } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

interface RightProps {
	open: () => void
	stopId: string
}
export default function Right({ open, stopId }: RightProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			{/* Patterns Butoon */}
			<Tooltip label="Ver Patterns Associados" position="bottom">
				<div className={styles.icon_blue} color="blue" onClick={open}>
					<IconEye />
				</div>
			</Tooltip>

			{/* Stop Button */}
			<Tooltip label="Ver esta paragem no Site" position="bottom">
				<div
					className={styles.icon_blue}
					onClick={() => window.open(`https://www.carrismetropolitana.pt/stops/${stopId}`, '_blank')}
				>
					<IconWorldUpload />
				</div>
			</Tooltip>
		</div>
	);
}
