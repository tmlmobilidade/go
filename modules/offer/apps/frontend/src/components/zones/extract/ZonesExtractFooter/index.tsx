'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useZonesExtractFormContext } from '../ZonesExtractForm.context';

/* * */

export function ZonesExtractFooter() {
	const { t } = useTranslation();
	const { actions, capabilities, status } = useZonesExtractFormContext();

	return (
		<Toolbar>
			<Spacer />
			<Button
				disabled={!capabilities?.createEnabled}
				icon={<IconFileDownload size={20} />}
				label={t('default:zones.extract.ZonesExtractFooter.button.label')}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
