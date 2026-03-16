'use client';

/* * */

import { usePeriodsDetailContext } from '@/components/year-periods/detail/PeriodsDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, IdTag, LockButton, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function PeriodsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const periodsDetailContext = usePeriodsDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.dates.YEAR_PERIODS_LIST);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<IdTag id={periodsDetailContext.data.period._id} copyOnClick />

			<Spacer />

			<LockButton
				isDisabled={!periodsDetailContext.flags.canLock}
				isLoading={periodsDetailContext.flags.isLocking}
				isLocked={periodsDetailContext.data.period.is_locked}
				onClick={periodsDetailContext.actions.lock}
			/>

			<Button
				disabled={!periodsDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={periodsDetailContext.flags.isSaving}
				onClick={periodsDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar este período? Esta ação não pode ser revertida."
				confirmTitle="Apagar Período"
				isDisabled={!periodsDetailContext.flags.canDelete}
				isLoading={periodsDetailContext.flags.isDeleting}
				onDelete={periodsDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
