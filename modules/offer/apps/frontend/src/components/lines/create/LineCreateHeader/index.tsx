'use client';

import { useLineCreateContext } from '@/components/lines/create/LineCreate.context';
import { closeCreateLineModal } from '@/components/lines/create/LineCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function LineCreateHeader() {
	//

	//
	// A. Setup variables

	const lineCreateContext = useLineCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateLineModal} type="close" />
			<Tag label="Nova Linha" variant="muted" />
			<Label size="lg" singleLine>{lineCreateContext.data.form.values.code}</Label>
			<Spacer />
			<Button
				disabled={!lineCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={lineCreateContext.flags.isSaving}
				onClick={lineCreateContext.actions.create}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
