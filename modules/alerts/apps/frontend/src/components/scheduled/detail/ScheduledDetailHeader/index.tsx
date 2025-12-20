'use client';

/* * */

import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { IconCopy, IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function ScheduledDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const alertDetailContext = useScheduledDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_LIST));
	};

	const handleDuplicate = () => {
		const id = alertDetailContext.data.id;

		router.replace(`${PAGE_ROUTES.alerts.SCHEDULED_DETAIL('new')}?copy=${id}`);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<Tag label={alertDetailContext.data.form.getValues().publish_status} variant={alertDetailContext.data.form.getValues().publish_status === 'PUBLISHED' ? 'primary' : 'muted'} />
			<Label size="lg" caps>{alertDetailContext.data.id}</Label>
			<Spacer />
			<Button
				icon={<IconCopy size={28} />}
				label="Duplicar"
				onClick={handleDuplicate}
				variant="secondary"
			/>
			<Button
				label="Salvar como rascunho"
				onClick={() => alertDetailContext.actions.saveAlert('draft')}
				variant="secondary"
			/>
			<Button
				disabled={alertDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				loading={alertDetailContext.flags.isSaving}
				onClick={() => alertDetailContext.actions.saveAlert('publish')}
				variant="primary"
				label={alertDetailContext.data.form.getValues().publish_status === 'DRAFT'
					? 'Publicar'
					: 'Salvar'}
			/>
			<Button
				disabled={alertDetailContext.flags.isSaving}
				icon={<IconTrash size={28} />}
				label="Apagar"
				onClick={alertDetailContext.actions.deleteAlert}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
