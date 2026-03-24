'use client';

/* * */

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { EventReplacementRule } from '@tmlmobilidade/types';
import { Checkbox, Divider, Grid, Section, Switch, Text, TimeInput } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { RuleCreateDates } from '../RuleCreateDates';
import { RuleCreateLines } from '../RuleCreateLines';
import { RuleCreateWeekdays } from '../RuleCreateWeekdays';
import { RuleCreateYearPeriods } from '../RuleCreateYearPeriods';

/* * */

export function RuleCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const createRuleContext = useRuleCreateContext();

	const isRestrictionRule = createRuleContext.data.form.values.kind === 'event_restriction';
	const isReplacementRule = createRuleContext.data.form.values.kind === 'event_replacement';
	const replacementValues = isReplacementRule ? createRuleContext.data.form.values as EventReplacementRule : null;

	//
	// B. Render components

	return (
		<Section gap="md">

			{/* Rule Type */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">1. Tipo de regra</Text>
				<Section>
					<Switch
						checked={isReplacementRule}
						description={isReplacementRule ? 'Exemplo: O dia 17/02/2026 (terça-feira) passa a funcionar como Sábado · Período Escolar.' : 'Ex: Dia 17/02/26 (terça-feira) tem oferta removida entre as 14h e 18h'}
						label={isReplacementRule ? 'Aplicar oferta de outro tipo de dia nestas datas' : 'Esta regra irá remover toda a oferta durante a duração do evento'}
						onChange={e => createRuleContext.data.form.setFieldValue('kind', e.currentTarget.checked ? 'event_replacement' : 'event_restriction')}
					/>
				</Section>
			</div>

			<Divider />

			{/* Days */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">2. Que dias serão afetados por esta regra?</Text>
				<RuleCreateDates />
			</div>

			<Divider />

			{/* Lines */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">3. Que linhas serão afetadas por esta regra?</Text>
				<RuleCreateLines />
			</div>

			<Divider />

			{/* Replacement rule conditions */}
			{isReplacementRule && (
				<div className={styles.sectionWrapper}>
					<Text size="lg">4. Que tipo de oferta se aplica nestes dias?</Text>
					<Text c="dimmed" size="sm">O(s) dia(s) selecionado(s) irão funcionar como:</Text>

					<Section>
						<Switch
							checked={Boolean(replacementValues?.same_weekday)}
							description="Cada data funciona como o seu próprio dia da semana real, mas no período selecionado. Ex: uma terça-feira funciona como terça-feira · Período de Verão."
							label="Mesmo dia da semana"
							onChange={(e) => {
								const enabled = e.currentTarget.checked;
								createRuleContext.data.form.setFieldValue('same_weekday', enabled);
								if (enabled) {
									createRuleContext.data.form.setFieldValue('weekdays', []);
								}
							}}
						/>
					</Section>

					{!replacementValues?.same_weekday && (
						<RuleCreateWeekdays />
					)}
					<RuleCreateYearPeriods />

				</div>
			)}

			{/* Restriction rule conditions */}
			{isRestrictionRule && (
				<div className={styles.sectionWrapper}>
					<Text size="lg">4. Quando decorre o evento?</Text>
					<Text c="dimmed" size="sm">A oferta é suspensa durante o período definido aqui</Text>

					<Checkbox
						key={createRuleContext.data.form.key('all_day')}
						label="Evento de dia completo"
						{...createRuleContext.data.form.getInputProps('all_day', { type: 'checkbox' })}
					/>

					{createRuleContext.data.form.values.kind === 'event_restriction' && !createRuleContext.data.form.values.all_day && (
						<Grid columns="ab" gap="sm">
							<TimeInput
								key={createRuleContext.data.form.key('start_time')}
								label="Hora de início"
								{...createRuleContext.data.form.getInputProps('start_time')}
							/>

							<TimeInput
								key={createRuleContext.data.form.key('end_time')}
								label="Hora de fim"
								{...createRuleContext.data.form.getInputProps('end_time')}
							/>
						</Grid>
					)}
				</div>
			)}

		</Section>
	);

	//
}
