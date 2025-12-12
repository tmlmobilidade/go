'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { BackButton, Button, keepUrlParams, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
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
		router.push(keepUrlParams(PAGE_ROUTES.stops.STOPS_LIST, window.location.search));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleClose} type="close" />
			<Tag label={stopDetailContext.data.stop?._id} variant="secondary" />
			<Spacer />
			<Button
				disabled={!stopDetailContext.data.form.isDirty() || !stopDetailContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={stopDetailContext.flags.isSaving}
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
