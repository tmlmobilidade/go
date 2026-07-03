'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { IconCalendar } from '@tabler/icons-react';
import { Button, Section, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function RuleCreateFooter() {
	//

	//
	// A. Setup variables

	const ruleCreateContext = useRuleCreateContext();

	//
	// B. Handle actions

	const handleShowAffectedDates = () => {
		ruleCreateContext.actions.openDrawer();
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<Section alignItems="center" flexDirection="row" padding="none">
				<IconCalendar size={20} />
				<Button
					c="var(--color-system-text-100)"
					label={`Esta regra afeta ${ruleCreateContext?.data?.ruleImpact?.count ?? 0} dias do calendário`}
					onClick={handleShowAffectedDates}
					style={{ textDecoration: 'underline' }}
					variant="transparent"
				/>
			</Section>

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
