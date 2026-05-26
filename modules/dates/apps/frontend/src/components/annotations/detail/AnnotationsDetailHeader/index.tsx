'use client';

import { useAnnotationsDetailContext } from '@/components/annotations/detail/AnnotationsDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, IdTag, LockButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function AnnotationsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const annotationsDetailContext = useAnnotationsDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.ANNOTATIONS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<IdTag id={annotationsDetailContext.data.annotation._id} copyOnClick />

			<Spacer />

			<LockButton
				isDisabled={!annotationsDetailContext.flags.canLock}
				isLocked={annotationsDetailContext.data.annotation.is_locked}
				onClick={annotationsDetailContext.actions.lock}
			/>

			<Button
				disabled={!annotationsDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={annotationsDetailContext.flags.isSaving}
				onClick={annotationsDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar esta ocorrência? Esta ação não pode ser revertida."
				confirmTitle="Apagar Anotação"
				isDisabled={!annotationsDetailContext.flags.canDelete}
				onDelete={annotationsDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
