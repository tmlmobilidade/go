'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { useEventsContext } from '@/contexts/Events.context';
import { Section, Select, StandardFormController, Switch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RuleCreateEvents() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const createRuleContext = useRuleCreateContext();
	const { data: eventsData } = useEventsContext();

	const eventOptions = useMemo(() => eventsData.raw.map(event => ({
		label: `${event.title} · ${event.code || event._id} · ${t('default:scheduling.copy.dayCount', '', { count: new Set(event.dates).size })}`,
		value: event._id,
	})), [eventsData.raw, t]);

	//
	// B. Handle actions

	const handleEventExceptionChange = (enabled: boolean) => {
		createRuleContext.actions.setEventExceptionEnabled(enabled);
		if (enabled) {
			createRuleContext.form.setValue('year_period_ids', [], { shouldDirty: true });
			createRuleContext.form.setValue('weekdays', [], { shouldDirty: true });
		} else {
			createRuleContext.form.setValue('event_id', undefined, { shouldDirty: true });
		}
		void createRuleContext.form.trigger();
	};

	const handleEventChange = (value: null | string) => {
		createRuleContext.form.setValue('event_id', value ?? undefined, { shouldDirty: true });
		// Selecting/clearing the event changes whether periods and weekdays are required.
		void createRuleContext.form.trigger();
	};

	//
	// C. Render components

	return (
		<Section gap="md">
			<Section gap="xs" padding="none">
				<Switch
					checked={createRuleContext.flags.isEventExceptionEnabled}
					description={t('default:scheduling.copy.eventHint')}
					label={t('default:scheduling.copy.eventException')}
					onChange={event => handleEventExceptionChange(event.currentTarget.checked)}
				/>
			</Section>

			{createRuleContext.flags.isEventExceptionEnabled && (
				<StandardFormController
					control={createRuleContext.form.control}
					name="event_id"
					render={({ field, fieldState }) => (
						<Select
							data={eventOptions}
							description={!createRuleContext.data.values.event_id ? t('default:patterns.create.RuleCreateEvents.select_event_first') : undefined}
							error={fieldState.error ? t('default:scheduling.copy.selectEvent') : undefined}
							label={t('default:scheduling.copy.event')}
							w="100%"
							{...field}
							onChange={handleEventChange}
							value={field.value ?? null}
							withAsterisk
						/>
					)}
				/>
			)}
		</Section>
	);
}
