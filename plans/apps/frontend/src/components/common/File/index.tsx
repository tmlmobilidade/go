/* * */

import { IconDownload, IconFile, IconFileTypeZip } from '@tabler/icons-react';
import { mimeTypes } from '@tmlmobilidade/lib';
import { type File } from '@tmlmobilidade/types';
import { Label, useToast } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function File({ file }: { file: File }) {
	//
	if (!file) {
		return null;
	}

	//
	// A. Setup variables

	//
	// B. Transform data
	let icon: React.ReactNode;

	switch (file.type) {
		case mimeTypes.zip:
			icon = <IconFileTypeZip size={32} />;
			break;
		default:
			icon = <IconFile size={32} />;
	}

	//
	// C. Define actions
	const handleDownload = async () => {
		if (!file.url) {
			return;
		}

		try {
			const a = document.createElement('a');
			a.href = file.url;
			a.download = file.name;
			a.click();

			useToast.info({
				message: `A transferência do ficheiro "${file.name}" está a começar...`,
				title: 'A transferir ficheiro',
			});
		}
		catch (error) {
			useToast.error({
				message: error instanceof Error ? error.message : 'Erro ao transferir ficheiro',
				title: 'Erro ao transferir ficheiro',
			});
		}
	};

	//
	// D. Render components
	return (
		<div className={styles.container}>
			<div className={styles.content} onClick={handleDownload}>
				{icon}
				<Label>{file._id}.{file.name.split('.').pop()}</Label>
			</div>
			{file.url && (
				<span className={styles.tooltip}>
					<IconDownload size={16} />
					Download
				</span>
			)}
		</div>
	);
}

/* * */
