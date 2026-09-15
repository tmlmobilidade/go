'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useYearPeriodsDetailYearPeriodId } from '../use-year-periods-detail-year-period-id';
import { useYearPeriodsDetailFormContext } from '../YearPeriodsDetailForm.context';

/* * */

export function YearPeriodsDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { yearPeriodId } = useYearPeriodsDetailYearPeriodId();

	const { actions, capabilities, form, status } = useYearPeriodsDetailFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.YEAR_PERIODS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />
			<IdTag id={yearPeriodId} copyOnClick />
			<Label size="lg" singleLine>{nameValue}</Label>

			<Spacer />

			<HasPermission action={PermissionCatalog.all.year_periods.actions.update} scope={PermissionCatalog.all.year_periods.scope}>
				<UpdateButton
					isDisabled={!capabilities.updateEnabled}
					isLoading={status.isUpdating}
					onClick={actions.update}
				/>
			</HasPermission>

			<HasPermission action={PermissionCatalog.all.year_periods.actions.lock} scope={PermissionCatalog.all.year_periods.scope}>
				<LockButton
					isDisabled={!capabilities.lockEnabled}
					isLoading={status.isLocking}
					isLocked={status.isLocked ?? false}
					onClick={actions.lock}
				/>
			</HasPermission>

			<HasPermission action={PermissionCatalog.all.year_periods.actions.delete} scope={PermissionCatalog.all.year_periods.scope}>
				<DeleteButton
					confirmMessage="Tem a certeza que deseja apagar este período? Esta ação não pode ser revertida."
					confirmTitle="Apagar Período"
					isDisabled={!capabilities.deleteEnabled}
					isLoading={status.isDeleting}
					onDelete={actions.delete}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);
}
