'use client';

/* * */

import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AlertCreateHeaderProps {
	onClose?: () => void
}

export function AlertCreateHeader({ onClose }: AlertCreateHeaderProps) {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.create.header' });
	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'operations' });

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={onClose} type="close" />
			<Tag label={t('new_alert_button_label')} variant="secondary" />
			<Spacer />
			<Button
				disabled={!alertCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={tGlobal('save_as_draft')}
				loading={alertCreateContext.flags.isSaving}
				onClick={() => alertCreateContext.actions.saveAlert('draft')}
				variant="secondary"
			/>
			<Button
				disabled={!alertCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={tGlobal('publish')}
				loading={alertCreateContext.flags.isSaving}
				onClick={() => alertCreateContext.actions.saveAlert('publish')}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
