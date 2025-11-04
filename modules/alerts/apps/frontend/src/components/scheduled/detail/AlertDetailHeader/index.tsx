'use client';

/* * */

import { AlertDetailMode, useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { IconCopy, IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

/* * */

export function AlertDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams('/alerts', window.location.search);
		router.push(destUrl);
	};

	const handleDuplicate = () => {
		const id = alertDetailContext.data.id;

		router.replace(`/alerts/new?copy=${id}`);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={alertDetailContext.data.form.getValues().publish_status} variant={alertDetailContext.data.form.getValues().publish_status === 'PUBLISHED' ? 'primary' : 'muted'} />
			<Label size="lg" caps>{alertDetailContext.data.id}</Label>
			<Spacer />
			{alertDetailContext.flags.mode === AlertDetailMode.EDIT && (
				<Button
					icon={<IconCopy size={28} />}
					label="Duplicar"
					onClick={handleDuplicate}
					variant="secondary"
				/>
			)}
			<Button
				label="Salvar como rascunho"
				onClick={() => alertDetailContext.actions.saveAlert('draft')}
				variant="secondary"
			/>
			<Button
				disabled={!alertDetailContext.flags.canSave || alertDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				loading={alertDetailContext.flags.isSaving}
				onClick={() => alertDetailContext.actions.saveAlert('publish')}
				variant="primary"
				label={
					alertDetailContext.flags.mode === AlertDetailMode.CREATE
						? 'Publicar'
						: 'Salvar'
				}
			/>
			{alertDetailContext.flags.mode === AlertDetailMode.EDIT && (
				<Button
					disabled={alertDetailContext.flags.isSaving}
					icon={<IconTrash size={28} />}
					label="Apagar"
					onClick={alertDetailContext.actions.deleteAlert}
					variant="danger"
				/>
			)}
		</Toolbar>
	);

	//
}
