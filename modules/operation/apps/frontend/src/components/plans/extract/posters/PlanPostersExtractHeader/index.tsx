'use client';

import { IconFileTypePdf } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { usePlanPostersExtractFormContext } from '../PlanPostersExtract.context';
import { closePlanPostersExtractModal } from '../PlanPostersExtract.modal';

/* * */

export function PlanPostersExtractHeader() {
	//

	//
	// A. Setup variables

	const context = usePlanPostersExtractFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closePlanPostersExtractModal} type="close" />
			<Label size="lg" caps singleLine>Gerar PDFs</Label>
			<Spacer />
			<Button
				disabled={!context.flags.canSave}
				icon={<IconFileTypePdf />}
				label="Gerar PDFs"
				loading={context.flags.loading}
				onClick={context.actions.exportPosters}
			/>
		</Toolbar>
	);

	//
}
