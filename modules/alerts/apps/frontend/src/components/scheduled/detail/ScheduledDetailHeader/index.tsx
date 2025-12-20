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
	const scheduledDetailContext = useScheduledDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.alerts.SCHEDULED_LIST));
	};

	const handleDuplicate = () => {
		const id = scheduledDetailContext.data.id;

		router.replace(`${PAGE_ROUTES.alerts.SCHEDULED_DETAIL('new')}?copy=${id}`);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<Tag label={scheduledDetailContext.data.form.getValues().publish_status} variant={scheduledDetailContext.data.form.getValues().publish_status === 'PUBLISHED' ? 'primary' : 'muted'} />
			<Label size="lg" caps>{scheduledDetailContext.data.id}</Label>
			<Spacer />
			<Button
				icon={<IconCopy size={28} />}
				label="Duplicar"
				onClick={handleDuplicate}
				variant="secondary"
			/>
			<Button
				label="Salvar como rascunho"
				onClick={scheduledDetailContext.actions.save}
				variant="secondary"
			/>
			<Button
				disabled={scheduledDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				loading={scheduledDetailContext.flags.isSaving}
				onClick={scheduledDetailContext.actions.save}
				variant="primary"
				label={scheduledDetailContext.data.form.getValues().publish_status === 'DRAFT'
					? 'Publicar'
					: 'Salvar'}
			/>
			<Button
				disabled={scheduledDetailContext.flags.isSaving}
				icon={<IconTrash size={28} />}
				label="Apagar"
				onClick={scheduledDetailContext.actions.delete}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
