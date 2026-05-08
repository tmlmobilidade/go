'use client';

import { useFareCreateContext } from '@/components/fares/create/FareCreate.context';
import { closeCreateFareModal } from '@/components/fares/create/FareCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function FareCreateHeader() {
	//

	//
	// A. Setup variables

	const fareCreateContext = useFareCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateFareModal} type="close" />
			<Tag label="Nova Tarifa" variant="muted" />
			<Label size="lg" singleLine>{fareCreateContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!fareCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={fareCreateContext.flags.isSaving}
				onClick={fareCreateContext.actions.create}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
