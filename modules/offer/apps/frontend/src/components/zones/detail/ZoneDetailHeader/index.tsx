'use client';

/* * */

import { useZoneDetailContext } from '@/components/zones/detail/ZoneDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, IdTag, LockButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function ZoneDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const zoneDetailContext = useZoneDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.ZONES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<IdTag id={zoneDetailContext.data.zone._id} copyOnClick />

			<Spacer />

			<LockButton
				isDisabled={!zoneDetailContext.flags.canLock}
				isLocked={zoneDetailContext.data.zone.is_locked}
				onClick={zoneDetailContext.actions.lock}
			/>

			<Button
				disabled={!zoneDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={zoneDetailContext.flags.isSaving}
				onClick={zoneDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar esta zona? Esta ação não pode ser revertida."
				confirmTitle="Apagar Zona"
				isDisabled={!zoneDetailContext.flags.canDelete}
				onDelete={zoneDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
