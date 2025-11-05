'use client';

/* * */

import { openChangePlanModal } from '@/components/plans/detail/ChangePlanModal';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { IconRefresh, IconUpload } from '@tabler/icons-react';
import { Permissions } from '@go/lib';
import { BackButton, Button, HasPermission, IconButton, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@go/utils';
import { useRouter } from 'next/navigation';

/* * */

export function PlansDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const plansDetailContext = usePlansDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams('/plans', window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<BackButton onClick={handleClose} type="close" />

			<Tag label={plansDetailContext.data.plan._id} variant="secondary" />

			<Spacer />

			<HasPermission
				action={Permissions.plans.actions.toggle_lock}
				resource_key="agency_ids"
				scope={Permissions.plans.scope}
				value={plansDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<LockButton
					isLocked={plansDetailContext.data.plan.is_locked}
					onClick={plansDetailContext.actions.toggleLock}
				/>
			</HasPermission>

			<HasPermission
				action={Permissions.plans.actions.update_gtfs_plan}
				resource_key="agency_ids"
				scope={Permissions.plans.scope}
				value={plansDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<IconButton
					disabled={plansDetailContext.data.plan.is_locked}
					icon={<IconRefresh />}
					onClick={() => openChangePlanModal(plansDetailContext.data.plan)}
					tooltip="Alterar Plano"
				/>
			</HasPermission>

			<HasPermission
				action={Permissions.plans.actions.update}
				resource_key="agency_ids"
				scope={Permissions.plans.scope}
				value={plansDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<Button
					disabled={plansDetailContext.flags.saving || !plansDetailContext.data.form.isDirty()}
					icon={<IconUpload size={28} />}
					label="Guardar"
					loading={plansDetailContext.flags.saving}
					onClick={plansDetailContext.actions.savePlan}
					variant="primary"
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
