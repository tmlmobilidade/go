'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsListExportFormContext } from '../AnnotationsListExport/AnnotationsListExportForm.context';

/* * */

export function AnnotationsListExportFooter() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, status } = useAnnotationsListExportFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Spacer />
			<Button
				disabled={!capabilities.createEnabled}
				label={t('annotations:list.AnnotationsListExportFooter.submit')}
				leftSection={<IconFileDownload size={20} />}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
