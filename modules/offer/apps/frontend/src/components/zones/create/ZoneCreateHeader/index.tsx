'use client';

import { useZoneCreateContext } from '@/components/zones/create/ZoneCreate.context';
import { closeCreateZoneModal } from '@/components/zones/create/ZoneCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function ZoneCreateHeader() {
	//

	//
	// A. Setup variables

	const zoneCreateContext = useZoneCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateZoneModal} type="close" />
			<Tag label="Nova Zona" variant="muted" />
			<Label size="lg" singleLine>{zoneCreateContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!zoneCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={zoneCreateContext.flags.isSaving}
				onClick={zoneCreateContext.actions.create}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
