'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { IconCopy } from '@tabler/icons-react';
import { CloseButton, DeleteButton, IconButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

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

			{ruleCreateContext.flags.isEditing && ruleCreateContext.actions.duplicateRule && (
				<IconButton
					icon={<IconCopy size={20} />}
					onClick={ruleCreateContext.actions.duplicateRule}
					tooltip="Duplicar"
				/>
			)}

			{ruleCreateContext.flags.isEditing && ruleCreateContext.actions.deleteRule && (
				<DeleteButton
					confirmMessage="Tem a certeza que deseja apagar esta regra? Esta ação não pode ser revertida."
					confirmTitle="Apagar Regra"
					onDelete={ruleCreateContext.actions.deleteRule}
					showConfirmation
				/>
			)}

		</Toolbar>
	);

	//
}
