'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAlertsExtractFormContext } from '../AlertsExtractForm.context';

/* * */

export function AlertsExtractFooter() {
	const { t } = useTranslation();
	const { actions, capabilities, status } = useAlertsExtractFormContext();

	return (
		<Toolbar>
			<Spacer />
			<Button
				disabled={!capabilities?.createEnabled}
				icon={<IconFileDownload size={20} />}
				label={t('alerts:extract.AlertsExtractFooter.button.label')}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
