'use client';

/* * */

import { usePeriodsDetailContext } from '@/contexts/PeriodsDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { BackButton, Button, DeleteButton, HasPermission, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
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
		const destUrl = keepUrlParams(PAGE_ROUTES.dates.PERIODS_LIST, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<BackButton onClick={handleClose} type="close" />

			<Tag label={periodsDetailContext.data.period._id} variant="secondary" />

			<Spacer />

			<HasPermission
				action={PermissionCatalog.all.dates.actions.toggle_lock_periods}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.dates.scope}
				value={periodsDetailContext.data.period.agency_id}
			>
				<LockButton
					isLocked={periodsDetailContext.data.period.is_locked}
					onClick={periodsDetailContext.actions.toggleLock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.dates.actions.update_periods}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.dates.scope}
				value={periodsDetailContext.data.period.agency_id}
			>
				<Button
					disabled={periodsDetailContext.flags.read_only || periodsDetailContext.flags.saving || !periodsDetailContext.data.form.isDirty()}
					icon={<IconUpload size={28} />}
					label="Guardar"
					loading={periodsDetailContext.flags.saving}
					onClick={periodsDetailContext.actions.savePeriod}
					variant="primary"
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.dates.actions.delete_periods}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.dates.scope}
				value={periodsDetailContext.data.period.agency_id}
			>
				<DeleteButton
					confirmMessage="Tem a certeza que deseja apagar este período? Esta ação não pode ser revertida."
					confirmTitle="Apagar Período"
					onDelete={periodsDetailContext.actions.deletePeriod}
					showConfirmation
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
