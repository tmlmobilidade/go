'use client';

/* * */

import { useTypologyDetailContext } from '@/components/typologies/detail/TypologyDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, IdTag, LockButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function TypologyDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const typologyDetailContext = useTypologyDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.TYPOLOGIES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<IdTag id={typologyDetailContext.data.typology._id} copyOnClick />

			<Spacer />

			<LockButton
				isDisabled={!typologyDetailContext.flags.canLock}
				isLocked={typologyDetailContext.data.typology.is_locked}
				onClick={typologyDetailContext.actions.lock}
			/>

			<Button
				disabled={!typologyDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={typologyDetailContext.flags.isSaving}
				onClick={typologyDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar esta tipologia? Esta ação não pode ser revertida."
				confirmTitle="Apagar Tipologia"
				isDisabled={!typologyDetailContext.flags.canDelete}
				onDelete={typologyDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
