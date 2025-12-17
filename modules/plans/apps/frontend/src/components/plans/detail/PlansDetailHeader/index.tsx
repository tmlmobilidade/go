'use client';

/* * */

import { openChangePlanModal } from '@/components/plans/detail/ChangePlanModal';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { IconRefresh, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { BackButton, Button, HasPermission, IconButton, LockButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const plansDetailContext = usePlansDetailContext();
	const { t: tPlans } = useTranslation('plans', { keyPrefix: 'plans.detail.header' });
	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'operations' });

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams(PAGE_ROUTES.plans.APPROVED_LIST, window.location.search);
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
				action={PermissionCatalog.all.plans.actions.toggle_lock}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={plansDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<LockButton
					isLocked={plansDetailContext.data.plan.is_locked}
					onClick={plansDetailContext.actions.toggleLock}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.plans.actions.update_gtfs_plan}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={plansDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<IconButton
					disabled={plansDetailContext.data.plan.is_locked}
					icon={<IconRefresh />}
					onClick={() => openChangePlanModal(plansDetailContext.data.plan)}
					tooltip={tPlans('change_plan')}
				/>
			</HasPermission>

			<HasPermission
				action={PermissionCatalog.all.plans.actions.update}
				resourceKey="agency_ids"
				scope={PermissionCatalog.all.plans.scope}
				value={plansDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<Button
					disabled={plansDetailContext.flags.saving || !plansDetailContext.data.form.isDirty()}
					icon={<IconUpload size={28} />}
					label={tGlobal('save')}
					loading={plansDetailContext.flags.saving}
					onClick={plansDetailContext.actions.savePlan}
					variant="primary"
				/>
			</HasPermission>

		</Toolbar>
	);

	//
}
