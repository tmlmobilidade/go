'use client';

/* * */

import { usePeriodsContext } from '@/contexts/Periods.context';
import { Button, Section, Tag, Text } from '@tmlmobilidade/ui';

import { useRuleCreateContext } from '../RuleCreate.context';

/* * */

export function RuleCreatePeriods() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	const { data: periodsData } = usePeriodsContext();

	console.log(periodsData);

	const PERIOD_OPTIONS = periodsData.periods.map(period => ({
		label: period.name,
		value: period._id,
	}));

	// const PERIOD_OPTIONS = [
	// 	{ label: 'Período Escolar', value: 'escolar' },
	// 	{ label: 'Férias de Verão', value: 'ferias_verao' },
	// 	{ label: 'Férias de Natal', value: 'ferias_natal' },
	// 	{ label: 'Férias da Páscoa', value: 'ferias_pascoa' },
	// ];

	//
	// B. Handle actions

	const handleChangePeriods = (periodValue: string) => {
		const currentPeriodIds = createRuleContext.data.form.values.periodIds || [];
		if (currentPeriodIds.includes(periodValue)) {
			// Remove period
			const newPeriodIds = currentPeriodIds.filter(id => id !== periodValue);
			createRuleContext.data.form.setFieldValue('periodIds', newPeriodIds);
		}
		else {
			// Add period
			const newPeriodIds = [...currentPeriodIds, periodValue];
			createRuleContext.data.form.setFieldValue('periodIds', newPeriodIds);
		}
	};

	const handleQuickSelectPeriods = (type: 'all') => {
		const selections = {
			all: PERIOD_OPTIONS.map(period => period.value),
		};
		const currentPeriodIds = createRuleContext.data.form.values.periodIds || [];
		const allSelected = selections[type].every(id => currentPeriodIds.includes(id));

		if (allSelected) {
			// Deselect all
			createRuleContext.data.form.setFieldValue('periodIds', []);
		}
		else {
			// Select all
			createRuleContext.data.form.setFieldValue('periodIds', selections[type]);
		}
	};

	//
	// C. Render components

	const allPeriodsSelected = PERIOD_OPTIONS.every(period =>
		createRuleContext.data.form.values.periodIds?.includes(period.value),
	);

	return (
		<Section gap="md">

			<Section gap="xs" padding="none">
				<Text>Períodos</Text>
			</Section>

			{/* Quick Select Tags */}
			<Section flexDirection="row" gap="sm" padding="none">
				<Tag label="Todos" onClick={() => handleQuickSelectPeriods('all')} variant={allPeriodsSelected ? 'primary' : 'muted'} />
			</Section>

			<Section flexDirection="row" gap="sm" padding="none">
				{PERIOD_OPTIONS.length > 0 && PERIOD_OPTIONS.map((period) => {
					const isSelected = createRuleContext.data.form.values.periodIds?.includes(period.value);
					return (
						<Button
							key={period.value}
							label={period.label}
							onClick={() => handleChangePeriods(period.value)}
							variant={isSelected ? 'primary' : 'muted'}
						/>
					);
				})}
			</Section>

		</Section>
	);
}
