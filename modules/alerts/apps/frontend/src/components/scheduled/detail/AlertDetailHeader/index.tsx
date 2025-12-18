'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { IconCopy, IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const alertDetailContext = useAlertDetailContext();
	const { t } = useTranslation('global', { keyPrefix: 'operations' });

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_LIST, window.location.search);
		router.push(destUrl);
	};

	const handleDuplicate = () => {
		const id = alertDetailContext.data.id;

		router.replace(`${PAGE_ROUTES.alerts.SCHEDULED_DETAIL('new')}?copy=${id}`);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={alertDetailContext.data.form.getValues().publish_status} variant={alertDetailContext.data.form.getValues().publish_status === 'PUBLISHED' ? 'primary' : 'muted'} />
			<Label size="lg" caps>{alertDetailContext.data.id}</Label>
			<Spacer />
			<Button
				icon={<IconCopy size={28} />}
				label={t('duplicate')}
				onClick={handleDuplicate}
				variant="secondary"
			/>
			<Button
				label={t('save_as_draft')}
				onClick={() => alertDetailContext.actions.saveAlert('draft')}
				variant="secondary"
			/>
			<Button
				disabled={!alertDetailContext.flags.canSave || alertDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				loading={alertDetailContext.flags.isSaving}
				onClick={() => alertDetailContext.actions.saveAlert('publish')}
				variant="primary"
				label={alertDetailContext.data.form.getValues().publish_status === 'DRAFT'
					? t('publish')
					: t('save')}
			/>
			<Button
				disabled={alertDetailContext.flags.isSaving}
				icon={<IconTrash size={28} />}
				label={t('delete')}
				onClick={alertDetailContext.actions.deleteAlert}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
