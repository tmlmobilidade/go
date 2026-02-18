/* * */

import { IconDownload, IconFile, IconFileTypeZip } from '@tabler/icons-react';
import { mimeTypes } from '@tmlmobilidade/consts';
import { type File } from '@tmlmobilidade/types';
import { Label } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface FileComponentProps {
	fileData: File
	onClick?: () => void
}

/* * */

export function FileComponent({ fileData, onClick }: FileComponentProps) {
	//

	//
	// A. Transform data

	const fileIcon = useMemo(() => {
		switch (fileData.type) {
			case mimeTypes.zip:
				return <IconFileTypeZip size={32} />;
			default:
				return <IconFile size={32} />;
		}
	}, [fileData.type]);

	//
	// B. Render components

	return (
		<div className={styles.container}>

			<div className={styles.content} onClick={onClick}>
				{fileIcon}
				<Label>{fileData.name}</Label>
			</div>

			{fileData.url && (
				<span className={styles.tooltip}>
					<IconDownload size={16} />
					Download
				</span>
			)}

		</div>
	);
}
