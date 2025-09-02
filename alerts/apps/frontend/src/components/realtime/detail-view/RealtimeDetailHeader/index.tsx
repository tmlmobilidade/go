'use client';

/* * */

import { RealtimeDetailMode, useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { IconCopy, IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
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
		const destUrl = keepUrlParams('/realtimes', window.location.search);
		router.push(destUrl);
	};

	const handleDuplicate = () => {
		const id = realtimeDetailContext.data.id;

		router.replace(`/realtimes/new?copy=${id}`);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={realtimeDetailContext.data.form.getValues().publish_status} variant={realtimeDetailContext.data.form.getValues().publish_status === 'PUBLISHED' ? 'primary' : 'muted'} />
			<Label size="lg" caps>{realtimeDetailContext.data.id}</Label>
			<Spacer />
			{realtimeDetailContext.flags.mode === RealtimeDetailMode.EDIT && (
				<Button
					icon={<IconCopy size={28} />}
					label="Duplicar"
					onClick={handleDuplicate}
					variant="secondary"
				/>
			)}
			<Button
				label="Salvar como rascunho"
				onClick={() => realtimeDetailContext.actions.saveRealtime('draft')}
				variant="secondary"
			/>
			<Button
				disabled={!realtimeDetailContext.flags.canSave || realtimeDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				loading={realtimeDetailContext.flags.isSaving}
				onClick={() => realtimeDetailContext.actions.saveRealtime('publish')}
				variant="primary"
				label={
					realtimeDetailContext.flags.mode === RealtimeDetailMode.CREATE
						? 'Publicar'
						: 'Salvar'
				}
			/>
			{realtimeDetailContext.flags.mode === RealtimeDetailMode.EDIT && (
				<Button
					disabled={realtimeDetailContext.flags.isSaving}
					icon={<IconTrash size={28} />}
					label="Apagar"
					onClick={realtimeDetailContext.actions.deleteRealtime}
					variant="danger"
				/>
			)}
		</Toolbar>
	);

	//
}
