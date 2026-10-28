'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { MONTH_OPTIONS } from '@tmlmobilidade/go-types-offer';
import { Section, SegmentedMultiSelect, Text } from '@tmlmobilidade/ui';

/* * */

export function RuleCreateMonths() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>Meses {createRuleContext.flags.isEventExceptionEnabled ? 'do evento' : ''}</Text>
				{createRuleContext.flags.isEventExceptionEnabled && <Text c="dimmed">Se não selecionar, aplica-se a todos os meses do evento</Text>}
			</Section>

			<SegmentedMultiSelect
				value={createRuleContext.data.values.months || []}
				onChange={(selectedDays) => {
					createRuleContext.form.setValue('months', selectedDays.length > 0 ? selectedDays : undefined, { shouldDirty: true, shouldValidate: true });
				}}
				options={MONTH_OPTIONS.map(o => ({
					ariaLabel: o.label,
					label: o.label,
					value: o.value,
				}))}
			/>

		</Section>
	);
}
