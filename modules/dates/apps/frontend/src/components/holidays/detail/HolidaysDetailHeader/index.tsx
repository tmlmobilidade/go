'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useHolidaysDetailFormContext } from '../HolidaysDetailForm.context';
import { useHolidaysDetailHolidayId } from '../use-holidays-detail-holiday-id';

/* * */

export function HolidaysDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { holidayId } = useHolidaysDetailHolidayId();

	const { actions, capabilities, form, status } = useHolidaysDetailFormContext();

	const titleValue = useStandardFormWatch({ control: form.control, name: 'title' });

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
			<IdTag id={holidayId} copyOnClick />
			<Label size="lg" singleLine>{titleValue}</Label>

			<Spacer />

			<HasPermission action={PermissionCatalog.all.holidays.actions.update} scope={PermissionCatalog.all.holidays.scope}>
				<UpdateButton
					isDisabled={!capabilities.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission action={PermissionCatalog.all.holidays.actions.lock} scope={PermissionCatalog.all.holidays.scope}>
				<LockButton
					isDisabled={!capabilities.lockEnabled}
					isLoading={status.isLocking}
					isLocked={status.isLocked ?? false}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission action={PermissionCatalog.all.holidays.actions.delete} scope={PermissionCatalog.all.holidays.scope}>
				<DeleteButton
					confirmMessage="Tem a certeza que deseja apagar este feriado? Esta ação não pode ser revertida."
					confirmTitle="Apagar Feriado"
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);
}
