'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useNodesExtractV1FormContext } from '../NodesExtractV1Form.context';

/* * */

export function NodesExtractV1Footer() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, status } = useNodesExtractV1FormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Spacer />
			<Button
				disabled={!capabilities.createEnabled}
				icon={<IconFileDownload size={20} />}
				label={t('stops:extract.NodesExtractV1Footer.button.label')}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
