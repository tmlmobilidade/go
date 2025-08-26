'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { BackButton, Button, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function StopDetailHeader() {
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
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={stopDetailContext.data.stop?._id} variant="secondary" />
			<Spacer />
			<Button
				disabled={!stopDetailContext.flags.can_save}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={stopDetailContext.flags.saving}
				onClick={stopDetailContext.actions.saveStop}
				variant="primary"
			/>
			<Button
				icon={<IconTrash size={28} />}
				label="Eliminar"
				onClick={stopDetailContext.actions.deleteStop}
				variant="danger"
			/>
		</Toolbar>
	);

	//
}
