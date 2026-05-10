'use client';

import { useFareDetailContext } from '@/components/fares/detail/FareDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, IdTag, LockButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function FareDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const fareDetailContext = useFareDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.FARES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<IdTag id={fareDetailContext.data.fare._id} copyOnClick />

			<Spacer />

			<LockButton
				isDisabled={!fareDetailContext.flags.canLock}
				isLocked={fareDetailContext.data.fare.is_locked}
				onClick={fareDetailContext.actions.lock}
			/>

			<Button
				disabled={!fareDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={fareDetailContext.flags.isSaving}
				onClick={fareDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar esta tarifa? Esta ação não pode ser revertida."
				confirmTitle="Apagar Tarifa"
				isDisabled={!fareDetailContext.flags.canDelete}
				onDelete={fareDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
