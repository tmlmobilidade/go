'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const realtimeDetailContext = useRealtimeDetailContext();
	const { t } = useTranslation('global', { keyPrefix: 'operations' });

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.alerts.REALTIME_LIST, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={realtimeDetailContext.data.form.getValues().publish_status} variant={realtimeDetailContext.data.form.getValues().publish_status === 'PUBLISHED' ? 'primary' : 'muted'} />
			<Label size="lg" caps>{realtimeDetailContext.data.id}</Label>
			<Spacer />
			<Button
				disabled={!realtimeDetailContext.flags.canSave || realtimeDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				label={t('publish')}
				loading={realtimeDetailContext.flags.isSaving}
				onClick={() => realtimeDetailContext.actions.saveAlert()}
				variant="primary"
			/>
			<Button
				disabled={realtimeDetailContext.flags.isSaving}
				icon={<IconTrash size={28} />}
				label={t('delete')}
				onClick={realtimeDetailContext.actions.deleteAlert}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
