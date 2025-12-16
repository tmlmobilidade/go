'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function RealtimeDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.alerts.REALTIME_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<Tag label={realtimeDetailContext.data.form.getValues().publish_status} variant={realtimeDetailContext.data.form.getValues().publish_status === 'PUBLISHED' ? 'primary' : 'muted'} />
			<Label size="lg" caps>{realtimeDetailContext.data.id}</Label>
			<Spacer />
			<Button
				disabled={!realtimeDetailContext.flags.canSave || realtimeDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={realtimeDetailContext.flags.isSaving}
				onClick={() => realtimeDetailContext.actions.saveAlert()}
				variant="primary"
			/>
			<Button
				disabled={realtimeDetailContext.flags.isSaving}
				icon={<IconTrash size={28} />}
				label="Apagar"
				onClick={realtimeDetailContext.actions.deleteAlert}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
