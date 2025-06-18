'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { IconDeviceFloppy, IconTrash, IconWorldUpload } from '@tabler/icons-react';
import { ActionIcon, Tooltip } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';

import styles from './styles.module.css';

/* * */

export function SpecificHeader() {
	//

	//
	// A. Setup variables
	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components
	return (
		<div className={styles.header}>
			<div className={styles.section}>
				<h3>{stopsDetailContext.data.form.getValues().name || <i>Paragem sem Título</i>}</h3>
			</div>

			<div className={styles.section}>
				{/* Stop Button */}
				<Link href={`https://www.carrismetropolitana.pt/stops/${stopsDetailContext.data._id}`} target="_blank">
					<Tooltip label="Ver esta paragem no Site" position="bottom">
						<ActionIcon
							className={styles.iconBlue}
							variant="secondary"
						>
							<IconWorldUpload />
						</ActionIcon>
					</Tooltip>
				</Link>

				{/* Save Button */}
				<Tooltip label="Salvar Paragem" position="bottom">
					<div
						className={styles.iconBlue}
						onClick={() => stopsDetailContext.actions.saveStop()}
					>
						<IconDeviceFloppy />
					</div>
				</Tooltip>

				{/* Delete Button */}
				<Tooltip label="Apagar Paragem" position="bottom">
					<div
						className={styles.iconBlue}
						onClick={() => {
							stopsDetailContext.actions.deleteStop();
							redirect('/stops', RedirectType.replace);
						}}
					>
						<IconTrash />
					</div>
				</Tooltip>
			</div>
		</div>
	);
}
