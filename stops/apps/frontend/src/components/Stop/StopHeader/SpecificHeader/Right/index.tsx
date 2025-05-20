'use client';

import { Routes } from '@/lib/routes';
import { IconDeviceFloppy, IconPlus, IconTrash, IconWorldUpload } from '@tabler/icons-react';
import { ActionIcon, Tooltip } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';

import styles from '../styles.module.css';

export function Right({ actions, data, open }) {
	//
	// B. Render components

	return (
		<div className={styles.section}>
			{/* Patterns Butoon */}
			{/* <Tooltip label="Ver Patterns Associados" position="bottom">
				<div className={styles.iconBlue} color="blue" onClick={open}>
					<IconEye />
				</div>
			</Tooltip> */}

			{/* Stop Button */}
			<Link href={`https://www.carrismetropolitana.pt/stops/${data._id}`}>
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
