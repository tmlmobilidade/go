'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { useEventsContext } from '@/contexts/Events.context';
import { Dates, FORMATS } from '@tmlmobilidade/dates';
import { Section, Select, StandardFormController, Switch } from '@tmlmobilidade/ui';

/* * */

export function RuleCreateEvents() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();
	const { data: eventsData } = useEventsContext();

	const EVENT_OPTIONS = eventsData.raw.map(event => ({
		label: `${event.title} (${event.dates.toSorted().map(date => Dates.fromOperationalDate(date, 'Europe/Lisbon').toLocaleString(FORMATS.DATE_FULL, 'pt-PT')).join(', ')})`,
		value: event._id,
	}));

	//
	// B. Render components

	return (
		<Section gap="md">
			<Section gap="xs" padding="none">
				<Switch
					checked={createRuleContext.flags.isEventExceptionEnabled}
					description="Se ativado, a regra aplica-se apenas ao evento selecionado e ignora períodos e dias da semana."
					label="Exceção por evento"
					onChange={(event) => {
						const enabled = event.currentTarget.checked;
						createRuleContext.actions.setEventExceptionEnabled(enabled);
						if (enabled) {
							createRuleContext.form.setValue('year_period_ids', [], { shouldDirty: true, shouldValidate: true });
							createRuleContext.form.setValue('weekdays', [], { shouldDirty: true, shouldValidate: true });
						} else {
							createRuleContext.form.setValue('event_id', undefined, { shouldDirty: true, shouldValidate: true });
						}
					}}
				/>
			</Section>

			{createRuleContext.flags.isEventExceptionEnabled && (
				<StandardFormController
					control={createRuleContext.form.control}
					name="event_id"
					render={({ field, fieldState }) => (
						<Select
							data={EVENT_OPTIONS}
							error={fieldState.error?.message}
							w="100%"
							{...field}
							value={field.value ?? null}
						/>
					)}
				/>
			)}
		</Section>
	);
}
