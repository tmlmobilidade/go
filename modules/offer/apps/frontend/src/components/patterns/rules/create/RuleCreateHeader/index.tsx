'use client';

/* * */

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RuleCreateHeader() {
	//

	//
	// A. Setup variables

	const ruleCreateContext = useRuleCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateRuleModal} type="close" />
			<Tag label="Nova Regra" variant="muted" />
			{/* <Spacer />
			<Button
				disabled={!ruleCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Criar"
				// loading={ruleCreateContext.flags.isSaving}
				onClick={ruleCreateContext.actions.create}
				variant="primary"
			/> */}
		</Toolbar>
	);

	//
}
