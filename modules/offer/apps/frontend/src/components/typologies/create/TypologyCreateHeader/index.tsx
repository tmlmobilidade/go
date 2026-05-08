'use client';

import { useTypologyCreateContext } from '@/components/typologies/create/TypologyCreate.context';
import { closeCreateTypologyModal } from '@/components/typologies/create/TypologyCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function TypologyCreateHeader() {
	//

	//
	// A. Setup variables

	const typologyCreateContext = useTypologyCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateTypologyModal} type="close" />
			<Tag label="Nova Tipologia" variant="muted" />
			<Label size="lg" singleLine>{typologyCreateContext.data.form.values.name}</Label>
			<Spacer />
			<Button
				disabled={!typologyCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={typologyCreateContext.flags.isSaving}
				onClick={typologyCreateContext.actions.create}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
