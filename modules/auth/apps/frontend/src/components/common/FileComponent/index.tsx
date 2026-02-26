/* eslint-disable react-hooks/rules-of-hooks */
/* * */

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { IconDownload, IconFile, IconFileTypeZip } from '@tabler/icons-react';
import { mimeTypes } from '@tmlmobilidade/consts';
import { Label, useToast } from '@tmlmobilidade/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';
interface FileComponentProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	file: any
	label?: string
}

/* * */

export function FileComponent({ file, label }: FileComponentProps) {
	//

	//
	if (!file) {
		return null;
	}

	//
	// A. Setup variables

	const { t } = useTranslation();
	const agencyDetailContext = useAgencyDetailContext();

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
	// C. Handle actions
	const handleDownload = () => {
		try {
			// Convert object to formatted JSON string
			const jsonString = JSON.stringify(file, null, 2);

			// Create blob
			const blob = new Blob([jsonString], {
				type: 'application/json',
			});

			// Create temporary URL
			const url = URL.createObjectURL(blob);

			// Create anchor and trigger download
			const a = document.createElement('a');
			a.href = url;
			// Get short_name from form values (more reliable) or agency data, with fallback
			const shortName = agencyDetailContext.data.form.getValues().short_name || agencyDetailContext.data.agency?.short_name || agencyDetailContext.data.agency?.name;
			a.download = `${shortName}-validation-rules.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			// Cleanup
			URL.revokeObjectURL(url);

			useToast.info({
				message: t('default:common.FileComponent.downloadStarted'),
				title: t('default:common.FileComponent.downloadTitle'),
			});
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			useToast.error({
				message: t('default:common.FileComponent.downloadFailed'),
				title: t('default:common.FileComponent.downloadError'),
			});
		}
	};

	//
	// D. Render components
	return (
		<div className={styles.container}>
			<div
				className={styles.content}
				onClick={handleDownload}
				role="button"
			>
				{icon}
				<Label>{label ?? 'Download JSON'}</Label>
			</div>

			<span className={styles.tooltip}>
				<IconDownload size={16} />
				Download
			</span>
		</div>
	);
}
