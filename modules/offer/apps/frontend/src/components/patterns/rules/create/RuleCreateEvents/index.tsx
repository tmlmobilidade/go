'use client';

/* * */

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { useEventsContext } from '@/contexts/Events.context';
import { Dates, Formats } from '@tmlmobilidade/dates';
import { Section, Select, Switch } from '@tmlmobilidade/ui';

/* * */

export function RuleCreateEvents() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();
	const { data: eventsData } = useEventsContext();

	const EVENT_OPTIONS = eventsData.raw.map(event => ({
		label: `${event.title} (${event.dates.sort().map(date => Dates.fromOperationalDate(date, 'Europe/Lisbon').toLocaleString(Formats.DATE_FULL, 'pt-PT')).join(', ')})`,
		value: event._id,
	}));

	//
	// C. Render components

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
							createRuleContext.data.form.setFieldValue('yearPeriodIds', []);
							createRuleContext.data.form.setFieldValue('weekdays', []);
						} else {
							createRuleContext.data.form.setFieldValue('eventId', undefined);
						}
					}}
				/>
			</Section>

			{createRuleContext.flags.isEventExceptionEnabled && (
				<Select
					key={createRuleContext.data.form.key('eventId')}
					data={EVENT_OPTIONS}
					value={createRuleContext.data.form.values.eventId || []}
					w="100%"
					{...createRuleContext.data.form.getInputProps('eventId')}
				/>
			)}
		</Section>
	);
}
