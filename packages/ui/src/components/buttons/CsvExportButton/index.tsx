'use client';

import { IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { type CsvExportConfig, type CsvExportRow, downloadCsv } from '../../../utils/download-csv';
import { IconButton } from '../IconButton';

/* * */

interface CsvExportButtonProps {
	config: CsvExportConfig
	data: CsvExportRow[]
	disabled?: boolean
}

/* * */

export function CsvExportButton({ config, data, disabled }: CsvExportButtonProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleClick = () => {
		downloadCsv(data, config);
	};

	//
	// C. Render components

	return (
		<IconButton
			disabled={disabled ?? !data.length}
			icon={<IconDownload size={18} stroke={1.8} />}
			onClick={handleClick}
			tooltip={t('shared:components.buttons.CsvExportButton.tooltip')}
			variant="subtle"
		/>
	);

	//
}
