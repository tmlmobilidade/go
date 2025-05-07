'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Routes } from '@/lib/routes';
import { IconDeviceFloppy, IconEye, IconPlus, IconTrash, IconWorldUpload } from '@tabler/icons-react';
import { ActionIcon, Tooltip } from '@tmlmobilidade/ui';
import Link from 'next/link';
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
				<div className={styles.iconBlue} color="blue" onClick={open}>
					<IconEye />
				</div>
			</Tooltip>

			{/* Stop Button */}
			<Link href={`https://www.carrismetropolitana.pt/stops/${stop._id}`}>
				<Tooltip label="Ver esta paragem no Site" position="bottom">
					<ActionIcon
						className={styles.iconBlue}
						variant="secondary"
					>
						<IconWorldUpload />
					</ActionIcon>
				</Tooltip>
			</Link>

			{/* Create New Button */}
			<Link href={Routes.STOP_DETAIL('new')}>
				<Tooltip label="Criar Paragem" position="bottom">
					<ActionIcon
						className={styles.iconBlue}
						variant="primary"
					>
						<IconPlus />
					</ActionIcon>
				</Tooltip>
			</Link>
			{/* Save Button */}
			<Tooltip label="Salvar Paragem" position="bottom">
				<div
					className={styles.iconBlue}
					onClick={() => actions.saveStop()}
				>
					<IconDeviceFloppy />
				</div>
			</Tooltip>

			{/* Delete Button */}
			<Tooltip label="Apagar Paragem" position="bottom">
				<div
					className={styles.iconBlue}
					onClick={() => {
						actions.deleteStop();
						redirect('/stops', RedirectType.replace);
					}}
				>
					<IconTrash />
				</div>
			</Tooltip>
		</div>
	);
}
