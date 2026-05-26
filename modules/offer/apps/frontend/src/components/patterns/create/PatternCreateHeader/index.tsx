'use client';

import { usePatternCreateContext } from '@/components/patterns/create/PatternCreate.context';
import { closeCreatePatternModal } from '@/components/patterns/create/PatternCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function PatternCreateHeader() {
	//

	//
	// A. Setup variables

	const patternCreateContext = usePatternCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreatePatternModal} type="close" />
			<Tag label="Novo Pattern" variant="muted" />
			<Label size="lg" singleLine>{patternCreateContext.data.form.values.code}</Label>
			<Spacer />
			<Button
				disabled={!patternCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={patternCreateContext.flags.isSaving}
				onClick={patternCreateContext.actions.create}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
