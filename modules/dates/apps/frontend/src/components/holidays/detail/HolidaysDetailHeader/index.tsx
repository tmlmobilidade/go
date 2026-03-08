'use client';

/* * */

import { useHolidaysDetailContext } from '@/components/holidays/detail/HolidaysDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function HolidaysDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const holidaysDetailContext = useHolidaysDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.HOLIDAYS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<Tag label={holidaysDetailContext.data.holiday._id} variant="id" />

			<Spacer />

			<LockButton
				isDisabled={!holidaysDetailContext.flags.canLock}
				isLocked={holidaysDetailContext.data.holiday.is_locked}
				onClick={holidaysDetailContext.actions.lock}
			/>

			<Button
				disabled={!holidaysDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={holidaysDetailContext.flags.isSaving}
				onClick={holidaysDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar esta ocorrência? Esta ação não pode ser revertida."
				confirmTitle="Apagar Feriado"
				isDisabled={!holidaysDetailContext.flags.canDelete}
				onDelete={holidaysDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
