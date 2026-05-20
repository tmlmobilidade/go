'use client';

import { IconCheck, IconCircleDashed, IconFileDownload, IconLoader2, IconX } from '@tabler/icons-react';
import { FileExport } from '@tmlmobilidade/types';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { useExportsContext } from '../../../contexts';
import { Label } from '../../display';
import { Section } from '../../layout';

/* * */

export interface SidebarExportsItemProps {
	fileExport: FileExport
}

/* * */

export function SidebarExportsItem({ fileExport }: SidebarExportsItemProps) {
	//

	//
	// A. Setup variables
	const exportsContext = useExportsContext();

	const icon = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (fileExport.processing_status) {
			case 'complete':
				return <IconCheck color="var(--color-status-success-primary)" size={28} />;
			case 'processing':
				return <IconLoader2 className={styles.iconSpinner} color="var(--color-status-warning-primary)" size={28} />;
			case 'waiting':
				return <IconCircleDashed color="var(--color-system-text-200)" size={28} stroke={1.5} />;
			default:
				return <IconX color="var(--color-status-danger-primary)" size={28} stroke={1.5} />;
		}
	}, [fileExport.processing_status]);

	//
	// B. Render components

	return (
		<div className={styles.root}>
			<div
				className={styles.left}
				onClick={() => fileExport.processing_status === 'complete' && exportsContext.actions.download(fileExport._id)}
			>
				<Section flexDirection="row" gap="sm" justifyContent="space-between" padding="none" width="fit-content">
					<div className={styles.iconWrapper}>{icon}</div>
					<div>
						<Label size="md">{fileExport.file_name || 'Sem nome'}</Label>
						<div className={styles.body}>
							<Label size="sm">{fileExport.processing_status}</Label>
						</div>
					</div>
				</Section>
			</div>
			{fileExport.processing_status === 'complete' && (
				<div className={styles.right}>
					<IconFileDownload size={28} />
				</div>
			)}
		</div>
	);

	//
};
