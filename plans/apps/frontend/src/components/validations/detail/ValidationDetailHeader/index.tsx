'use client';

/* * */

import BackButton from '@/components/common/BackButton';
import { StatusTag } from '@/components/common/StatusTag';
import { useValidationDetailContext, ValidationDetailMode } from '@/contexts/ValidationDetail.context';
import { IconLock, IconLockOpen, IconTrash, IconUpload } from '@tabler/icons-react';
import { ActionIcon, Button, Label, Spacer } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
/* * */

export function ValidationDetailHeader() {
	//

	//
	// A. Setup variables

	const validationDetailContext = useValidationDetailContext();

	//
	// B. Render components
	const lockButton = useMemo(() => {
		const is_locked = validationDetailContext.data.form.getValues().is_locked;
		return (
			<ActionIcon
				variant={is_locked ? 'danger' : 'success'}
				onClick={() => {
					validationDetailContext.actions.toggleLock();
				}}
			>
				{is_locked ? <IconLock size={28} /> : <IconLockOpen size={28} />}
			</ActionIcon>
		);
	}, [validationDetailContext.data.form.getValues().is_locked]);

	return (
		<>
			<BackButton />
			<StatusTag status={validationDetailContext.data.form.getValues().feeder_status} />
			<Label size="lg" caps>{validationDetailContext.data.id}</Label>
			<Spacer />
			{lockButton}
			<Button
				disabled={!validationDetailContext.flags.canSave || validationDetailContext.flags.isSaving}
				icon={<IconUpload size={28} />}
				label={validationDetailContext.flags.mode === ValidationDetailMode.EDIT ? 'Salvar' : 'Publicar'}
				loading={validationDetailContext.flags.isSaving}
				variant="primary"
			/>
			{validationDetailContext.flags.mode === ValidationDetailMode.EDIT && (
				<Button
					disabled={validationDetailContext.flags.isSaving}
					icon={<IconTrash size={28} />}
					label="Apagar"
					variant="danger"
				/>
			)}
		</>
	);

	//
}
