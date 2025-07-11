'use client';

/* * */

import { usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { BackButton, Button, HasPermission, LockButton, Spacer, Tag } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

/* * */

export function PlanDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const planDetailContext = usePlanDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		const destUrl = keepUrlParams('/plans', window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={planDetailContext.data.plan._id} variant="secondary" />
			<Spacer />
			<LockButton isLocked={planDetailContext.data.plan.is_locked} onClick={planDetailContext.actions.toggleLock} />
			<HasPermission
				action={Permissions.plans.actions.update}
				resource_key="agency_ids"
				scope={Permissions.plans.scope}
				value={planDetailContext.data.plan.gtfs_agency.agency_id}
			>
				<Button
					disabled={planDetailContext.flags.isSaving || !planDetailContext.data.form.isDirty()}
					icon={<IconUpload size={28} />}
					label="Salvar"
					loading={planDetailContext.flags.isSaving}
					onClick={() => planDetailContext.actions.savePlan()}
					variant="primary"
				/>
			</HasPermission>
		</>
	);

	//
}
