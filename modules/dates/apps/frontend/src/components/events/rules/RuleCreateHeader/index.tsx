'use client';

/* * */

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/events/rules/RuleCreate.modal';
import { CloseButton, DeleteButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

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

			<Spacer />

			{ruleCreateContext.flags.isEditing && ruleCreateContext.actions.deleteRule && (
				<DeleteButton onDelete={ruleCreateContext.actions.deleteRule} />
			)}

		</Toolbar>
	);

	//
}
