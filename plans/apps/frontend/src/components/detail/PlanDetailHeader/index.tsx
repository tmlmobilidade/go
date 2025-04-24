'use client';

/* * */

import BackButton from '@/components/common/BackButton';
import { PlanDetailMode, usePlanDetailContext } from '@/contexts/PlanDetail.context';
import { IconLock, IconLockOpen, IconTrash, IconUpload } from '@tabler/icons-react';
import { PlanSchema } from '@tmlmobilidade/types';
import { ActionIcon, Button, Label, Spacer, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
/* * */

export function PlanDetailHeader() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();

	const variant = useMemo(() => {
		switch (planDetailContext.data.form.getValues().feeder_status) {
			case PlanSchema.shape.feeder_status.enum.error:
				return 'danger';
			case PlanSchema.shape.feeder_status.enum.processing:
				return 'warning';
			case PlanSchema.shape.feeder_status.enum.success:
				return 'success';
			default:
				return 'muted';
		}
	}, [planDetailContext.data.form.getValues().feeder_status]);

	//
	// B. Render components
	const lockButton = useMemo(() => {
		const is_locked = planDetailContext.data.form.getValues().is_locked;
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
	}, [planDetailContext.data.form.getValues().is_locked]);

	return (
		<>
			<BackButton />
			<Tag label={planDetailContext.data.form.getValues().feeder_status} variant={variant} />
			<Label size="lg" caps>{planDetailContext.data.id}</Label>
			<Spacer />
			{lockButton}
			<Button
				disabled={!planDetailContext.flags.canSave || planDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				label={planDetailContext.flags.mode === PlanDetailMode.EDIT ? 'Salvar' : 'Publicar'}
				loading={planDetailContext.flags.isSaving}
				variant="primary"
			/>
			{planDetailContext.flags.mode === PlanDetailMode.EDIT && (
				<Button
					disabled={planDetailContext.flags.isSaving}
					icon={<IconTrash size={28} />}
					label="Apagar"
					variant="danger"
				/>
			)}
		</>
	);

	//
}
