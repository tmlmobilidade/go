'use client';

import { IconFileDownload } from '@tabler/icons-react';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useRidesExtractV3FormContext } from '../RidesExtractV3Form.context';

/* * */

export function RidesExtractV3Footer() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions, capabilities, status } = useRidesExtractV3FormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Spacer />
			<Button
				disabled={!capabilities.createEnabled}
				icon={<IconFileDownload size={20} />}
				label={t('default:rides.extract.RidesExtractV3Footer.button.label')}
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
