'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
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
			<Tag label={ruleCreateContext.data.ruleSummary.short || 'Nova Regra'} variant="muted" />

			<Spacer />

			{ruleCreateContext.flags.isEditing && ruleCreateContext.actions.deleteRule && (
				<DeleteButton onDelete={ruleCreateContext.actions.deleteRule} />
			)}

		</Toolbar>
	);

	//
}
