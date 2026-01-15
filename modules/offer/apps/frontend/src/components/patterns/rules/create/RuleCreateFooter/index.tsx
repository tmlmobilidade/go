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

	//
	// B. Render components

	return (
		<Toolbar>

			<div className={styles.calendarSummary}>
				<IconCalendar size={20} />
				<Text style={{ cursor: 'pointer' }}>Esta regra afeta <span>{ruleCreateContext.data.ruleImpact.count}</span> dias do calendário</Text>
			</div>

			<Button label="Cancelar" onClick={closeCreateRuleModal} variant="danger" />
			<Button
				disabled={!ruleCreateContext.data.form.isValid()}
				label="Criar"
				onClick={ruleCreateContext.actions.create}
				variant="primary"
			/>

			{/* Dar disable do botão create até o utilizador preencher os campos mínimos obrigatórios
			e dar aknowledge do resumo/preview do calendário */}

		</Toolbar>
	);

	//
}
