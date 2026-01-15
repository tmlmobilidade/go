/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Collapsible, Section } from '@tmlmobilidade/ui';

import { closeCreateRuleModal, openCreateRuleModal } from '../../rules/create/RuleCreate.modal';
import PatternDetailRules from '../../rules/list/Rules';

/* * */

export function PatternDetailSectionOpRules() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	const rules = patternDetailContext.data.form.values.rules || [];

	//
	// B. Handle actions

	const handleOpenCreateModal = () => {
		openCreateRuleModal(patternDetailContext.data.agency_id, {
			onSuccess: (newRule) => {
				// Add the new rule to the form
				const currentRules = patternDetailContext.data.form.values.rules || [];
				patternDetailContext.data.form.setFieldValue('rules', [...currentRules, newRule]);
				closeCreateRuleModal();
			},
			patternId: patternDetailContext.data.id,
		});
	};

	const handleDeleteRule = (index: number) => {
		const currentRules = patternDetailContext.data.form.values.rules || [];
		patternDetailContext.data.form.setFieldValue('rules', currentRules.filter((_, i) => i !== index));
	};

	const handleOpenEditModal = (rule, index: number) => {
		openCreateRuleModal(patternDetailContext.data.agency_id, {
			initialValues: rule,
			onSuccess: (updatedRule, ruleIndex) => {
				// Update the rule at the specific index
				const currentRules = patternDetailContext.data.form.values.rules || [];
				const newRules = [...currentRules];
				if (ruleIndex !== undefined) {
					newRules[ruleIndex] = updatedRule;
					patternDetailContext.data.form.setFieldValue('rules', newRules);
				}
				closeCreateRuleModal();
			},
			patternId: patternDetailContext.data.id,
			ruleIndex: index,
		});
	};

	//
	// C. Render components

	return (
		<Collapsible title="Regras de funcionamento" defaultOpen>
			<Section gap="sm">
				{/* Render actual rules from pattern */}
				{rules.map((rule, index) => (
					<PatternDetailRules
						key={index}
						onDelete={() => handleDeleteRule(index)}
						onEdit={() => handleOpenEditModal(rule, index)}
						ruleData={{
							isOffTime: rule.operatingMode === 'exclude',
							name: rule.name || `Regra ${index + 1}`,
							times: rule.timePoints || [],
							travelTime: rule.travelTime || 'Base',
						}}
					/>
				))}

				{/* Empty state */}
				{rules.length === 0 && (
					<Section padding="none">
						<p style={{ color: 'var(--color-system-text-300)', textAlign: 'center' }}>
							Nenhuma regra definida. Clique em "Nova regra" para começar.
						</p>
					</Section>
				)}

				{/* Create Button */}
				<Button
					label="Nova regra"
					leftSection={<IconPlus size={16} />}
					onClick={handleOpenCreateModal}
				/>
			</Section>

		</Collapsible>
	);

	//
}
