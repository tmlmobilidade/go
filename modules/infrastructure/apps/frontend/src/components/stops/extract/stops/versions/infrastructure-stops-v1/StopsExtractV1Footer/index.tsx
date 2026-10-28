'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsExtractV1FormContext } from '../StopsExtractV1Form.context';

/* * */

export function StopsExtractV1Footer() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, status } = useStopsExtractV1FormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Spacer />
			<Button
				disabled={!capabilities.createEnabled}
				icon={<IconFileDownload size={20} />}
				label={t('stops:extract.StopsExtractV1Footer.button.label')}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
