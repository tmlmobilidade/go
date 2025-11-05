'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { Routes } from '@/lib/routes';
import { keepUrlParams } from '@go/utils';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@go/ui';
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
		const destUrl = keepUrlParams(Routes.REALTIME_LIST, window.location.search);
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
