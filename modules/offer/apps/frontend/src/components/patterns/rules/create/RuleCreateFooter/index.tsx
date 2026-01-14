'use client';

/* * */

import { useRuleCreateContext } from '@/components/patterns/rules/create/RuleCreate.context';
import { closeCreateRuleModal } from '@/components/patterns/rules/create/RuleCreate.modal';
import { usePeriodsContext } from '@/contexts/Periods.context';
import { computeRuleImpact } from '@/utils/rules/ruleAppliesToDate';
import { IconCalendar } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { Button, Text, Toolbar } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function RuleCreateFooter() {
	//

	//
	// A. Setup variables

	const ruleCreateContext = useRuleCreateContext();
	const { data } = usePeriodsContext();

	const ruleImpact = useMemo(() => computeRuleImpact(
		ruleCreateContext.data.form.values,
		{
			endDate: Dates.now('Europe/Lisbon').plus({ months: 1 }).js_date,
			events: new Set(),
			holidays: new Set(),
			periods: data.periods,
			startDate: new Date(),
		},
	), [ruleCreateContext.data.form.values, data.periods]);

	console.log('Impact', ruleCreateContext.data.form.values, ruleImpact.dates);

	//
	// B. Render components

	return (
		<Toolbar>

			<div className={styles.calendarSummary}>
				<IconCalendar size={20} />
				<Text style={{ cursor: 'pointer' }}>Esta regra afeta <span>{ruleImpact.count}</span> dias do calendário</Text>
			</div>

			<Button label="Cancelar" onClick={closeCreateRuleModal} variant="danger" />
			<Button
				label="Criar"
				onClick={ruleCreateContext.actions.create}
				variant="primary"
				disabled

				// loading={ruleCreateContext.flags.isSaving}
				// disabled={!ruleCreateContext.data.form.isValid()}

			/>

			{/* Dar disable do botão create até o utilizador preencher os campos mínimos obrigatórios
			e dar aknowledge do resumo/preview do calendário */}

		</Toolbar>
	);

	//
}
