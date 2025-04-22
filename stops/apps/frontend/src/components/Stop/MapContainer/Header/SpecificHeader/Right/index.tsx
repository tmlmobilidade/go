'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Routes } from '@/lib/routes';
import { IconDeviceFloppy, IconEye, IconPlus, IconTrash, IconWorldUpload } from '@tabler/icons-react';
import { Tooltip } from '@tmlmobilidade/ui';
import { redirect, RedirectType } from 'next/navigation';

import styles from '../styles.module.css';

interface RightProps {
	open: () => void
}
export default function Right({ open }: RightProps) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const { actions, data: stop } = stopDetailContext;

	//
	// B. Render components

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
					onClick={() => window.open(`https://www.carrismetropolitana.pt/stops/${stop._id}`, '_blank')}
				>
					<IconWorldUpload />
				</div>
			</Tooltip>

			{/* Create New Button */}
			<Tooltip label="Criar Paragem" position="bottom">
				<div
					className={styles.icon_blue}
					onClick={() => redirect(Routes.STOP_DETAIL('new'), RedirectType.replace)}
					// onClick={() => actions.saveStop()}
				>
					<IconPlus />
				</div>
			</Tooltip>

			{/* Save Button */}
			<Tooltip label="Salvar Paragem" position="bottom">
				<div
					className={styles.icon_blue}
					// onClick={() => redirect(Routes.STOP_DETAIL('new'), RedirectType.replace)}
					onClick={() => actions.saveStop()}
				>
					<IconDeviceFloppy />
				</div>
			</Tooltip>

			{/* Delete Button */}
			<Tooltip label="Apagar Paragem" position="bottom">
				<div
					className={styles.icon_blue}
					onClick={() => actions.deleteStop()}
				>
					<IconTrash />
				</div>
			</Tooltip>

		</div>
	);
}
