'use client';

/* * */

import { StopDetailMode, useStopDetailContext } from '@/contexts/StopDetails.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Spacer, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function StopHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const stopDetailContext = useStopDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push('/stops', { scroll: false });
	};

	//
	// C. Render components

	return (
		<>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={stopDetailContext.data.id} variant="secondary" />
			<Spacer />
			<Button
				disabled={!stopDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label={stopDetailContext.flags.mode === StopDetailMode.CREATE ? 'Publicar' : 'Guardar'}
				loading={stopDetailContext.flags.isSaving}
				onClick={stopDetailContext.actions.saveStop}
				variant="primary"
			/>
			{stopDetailContext.flags.mode === StopDetailMode.EDIT && (
				<Button
					icon={<IconTrash size={28} />}
					label="Apagar"
					onClick={stopDetailContext.actions.deleteStop}
					variant="danger"
				/>
			)}
		</>
	);

	//
}
