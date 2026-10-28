'use client';

import { useLineCreateContext } from '@/components/lines/create/LineCreate.context';
import { closeCreateLineModal } from '@/components/lines/create/LineCreate.modal';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';

/* * */

export function LineCreateHeader() {
	//

	//
	// A. Setup variables

	const lineCreateContext = useLineCreateContext();
	const lineCreateContextValues = useStandardFormWatch({ control: lineCreateContext.form.control });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateLineModal} type="close" />
			<Tag label="Nova Linha" variant="muted" />
			<Label size="lg" singleLine>{lineCreateContextValues.code}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.lines.actions.create} scope={PermissionCatalog.all.lines.scope}>
				<CreateButton
					isDisabled={!lineCreateContext.capabilities.createEnabled}
					isLoading={lineCreateContext.status.isCreating}
					onClick={lineCreateContext.actions.create}
				/>
			</HasPermission>
		</Toolbar>
	);

	//
}
