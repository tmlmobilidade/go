'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { useEventsContext } from '@/contexts/Events.context';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Section, Select, StandardFormController, Switch, useLocaleContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RuleCreateEvents() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: { locale } } = useLocaleContext();
	const createRuleContext = useRuleCreateContext();
	const { data: eventsData } = useEventsContext();

	const EVENT_OPTIONS = eventsData.raw.map(event => ({
		label: `${event.title} (${event.dates.toSorted().map(date => Dates.fromOperationalDateInt(date, 'Europe/Lisbon').toLocaleString({ day: 'numeric', month: 'long' }, locale)).join(', ')})`,
		value: event._id,
	}));

	//
	// B. Render components

	return (
		<Section gap="md">
			<Section gap="xs" padding="none">
				<Switch
					checked={createRuleContext.flags.isEventExceptionEnabled}
					description={t('default:scheduling.copy.eventHint')}
					label={t('default:scheduling.copy.eventException')}
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
							error={fieldState.error ? t('default:scheduling.copy.selectEvent') : undefined}
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
