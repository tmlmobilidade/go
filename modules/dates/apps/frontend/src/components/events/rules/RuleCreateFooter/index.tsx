'use client';

/* * */

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/events/rules/RuleCreate.modal';
import { Button, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RuleCreateFooter() {
	//

	//
	// A. Setup variables

	const ruleCreateContext = useRuleCreateContext();

	//
	// B. Handle actions

	//
	// C. Render components

	return (
		<Toolbar>
			<Spacer />

			<Button label="Cancelar" onClick={closeCreateRuleModal} variant="danger" />
			<Button
				disabled={!ruleCreateContext.data.form.isValid()}
				label={ruleCreateContext.flags.isEditing ? 'Editar' : 'Criar'}
				onClick={ruleCreateContext.actions.submitRule}
			/>
		</Toolbar>
	);

	//
}
