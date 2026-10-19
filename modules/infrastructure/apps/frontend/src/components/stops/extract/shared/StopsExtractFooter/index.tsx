'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsExtractFormContext } from '../StopsExtractForm.context';

/* * */

export function StopsExtractFooter() {
	const { t } = useTranslation();
	const { actions, capabilities, status } = useStopsExtractFormContext();

	return (
		<Toolbar>
			<Spacer />
			<Button
				disabled={!capabilities?.createEnabled}
				icon={<IconFileDownload size={20} />}
				label={t('default:stops.extract.StopsExtractFooter.button.label')}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
