'use client';

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { getMonthOptions } from '@tmlmobilidade/go-utils-dates';
import { Section, SegmentedMultiSelect, Text, useLocaleContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RuleCreateMonths() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const createRuleContext = useRuleCreateContext();
	const { data: { locale } } = useLocaleContext();

	//
	// B. Render components

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>{t(createRuleContext.flags.isEventExceptionEnabled ? 'default:scheduling.months.eventTitle' : 'default:scheduling.months.title')}</Text>
				{createRuleContext.flags.isEventExceptionEnabled && <Text c="dimmed">{t('default:scheduling.months.eventHint')}</Text>}
			</Section>

			<SegmentedMultiSelect
				value={createRuleContext.data.values.months || []}
				onChange={(selectedDays) => {
					createRuleContext.form.setValue('months', selectedDays.length > 0 ? selectedDays : undefined, { shouldDirty: true, shouldValidate: true });
				}}
				options={getMonthOptions(locale).map(o => ({
					ariaLabel: o.label,
					label: o.label,
					value: o.value,
				}))}
			/>

		</Section>
	);
}
