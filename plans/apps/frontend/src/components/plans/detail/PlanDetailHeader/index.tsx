'use client';

/* * */

import BackButton from '@/components/common/BackButton';
import { usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { IconLock, IconLockOpen, IconUpload } from '@tabler/icons-react';
import { Permissions } from '@tmlmobilidade/lib';
import { ActionIcon, Button, HasPermission, Label, Spacer, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
/* * */

export function PlanDetailHeader() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	//
	// B. Render components
	const lockButton = useMemo(() => {
		const is_locked = planDetailContext.data.plan.is_locked;
		return (
			<ActionIcon
				variant={is_locked ? 'danger' : 'success'}
				onClick={() => {
					planDetailContext.actions.toggleLock();
				}}
			>
				{is_locked ? <IconLock size={28} /> : <IconLockOpen size={28} />}
			</ActionIcon>
		);
	}, [planDetailContext.data.plan.is_locked]);

	return (
		<>
			<BackButton />
			<Tag label={planDetailContext.data.plan._id} variant="muted" />
			<Label size="lg" caps>{planDetailContext.data.id}</Label>
			<Spacer />
			{lockButton}
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
