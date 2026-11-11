'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesExtractV2FormContext } from '../RidesExtractV2Form.context';

/* * */

export function RidesExtractV2Footer() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, status } = useRidesExtractV2FormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Spacer />
			<Button
				disabled={!capabilities.createEnabled}
				icon={<IconFileDownload size={20} />}
				label={t('default:rides.extract.RidesExtractV2Footer.button.label')}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
