'use client';

import { usePatternCreateContext } from '@/components/patterns/create/PatternCreate.context';
import { closeCreatePatternModal } from '@/components/patterns/create/PatternCreate.modal';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, CreateButton, HasPermission, Label, Spacer, Tag, Toolbar, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PatternCreateHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const patternCreateContext = usePatternCreateContext();
	const patternCreateContextValues = useStandardFormWatch({ control: patternCreateContext.form.control });

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreatePatternModal} type="close" />
			<Tag label={t('patterns:create.PatternCreateHeader.new_pattern')} variant="muted" />
			<Label size="lg" singleLine>{patternCreateContextValues.code}</Label>
			<Spacer />
			<HasPermission action={PermissionCatalog.all.lines.actions.create} scope={PermissionCatalog.all.lines.scope}>
				<CreateButton
					isDisabled={!patternCreateContext.capabilities.createEnabled}
					isLoading={patternCreateContext.status.isCreating}
					onClick={patternCreateContext.actions.create}
				/>
			</HasPermission>
		</Toolbar>
	);

	//
}
