'use client';

/* * */

import { useRuleCreateContext } from '@/components/events/rules/RuleCreate.context';
import { IconClockPlay } from '@tabler/icons-react';
import { EventReplacementRule, HHMM } from '@tmlmobilidade/types';
import { Checkbox, Divider, Grid, Section, SegmentedControl, Switch, Text, TextInput } from '@tmlmobilidade/ui';

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
	// B. Handle actions

	const formatTimeInput = (value: string): HHMM => {
		const digits = value.replace(/\D/g, '').slice(0, 4);

		if (digits.length <= 2) return digits as HHMM;
		return `${digits.slice(0, 2)}:${digits.slice(2)}` as HHMM;
	};

	const handleUpdateOperationalTime = (field: 'end_time' | 'start_time') => (e: React.ChangeEvent<HTMLInputElement>) => {
		const formattedValue = formatTimeInput(e.target.value);
		createRuleContext.data.form.setFieldValue(field, formattedValue);
	};

	//
	// C. Render components

	return (
		<Section gap="md">

			{/* Rule Type */}
			<div className={styles.sectionWrapper}>
				<Text size="lg">1. Tipo de regra</Text>
				<Section gap="sm">
					<SegmentedControl
						onChange={value => createRuleContext.data.form.setFieldValue('kind', value as 'event_replacement' | 'event_restriction')}
						value={createRuleContext.data.form.values.kind}
						data={[
							{ label: 'Restrição de oferta', value: 'event_restriction' },
							{ label: 'Substituição de oferta', value: 'event_replacement' },
						]}
					/>
					{/* <Spacer orientation="vertical" size="md" /> */}
					<Text c="dimmed">{isReplacementRule ? 'Aplicar oferta de outro tipo de dia nestas datas' : 'Esta regra irá remover toda a oferta durante a duração do evento'}</Text>
					<Text c="dimmed" size="sm">{isReplacementRule ? 'Exemplo: O dia 17/02/2026 (terça-feira) passa a funcionar como Sábado · Período Escolar.' : 'Ex: Dia 17/02/26 (terça-feira) tem oferta removida entre as 14h e 18h'}</Text>
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

							<TextInput
								key={createRuleContext.data.form.key('start_time')}
								description="Formato HH:MM no dia operacional. Ex.: 10:00"
								label="Hora de início"
								leftSection={<IconClockPlay size={18} />}
								{...createRuleContext.data.form.getInputProps('start_time')}
								onChange={handleUpdateOperationalTime('start_time')}
							/>
							<TextInput
								key={createRuleContext.data.form.key('end_time')}
								description="Após a meia-noite, usar 24+ horas. Ex.: 02:00 → 26:00"
								label="Hora de fim"
								leftSection={<IconClockPlay size={18} />}
								{...createRuleContext.data.form.getInputProps('end_time')}
								onChange={handleUpdateOperationalTime('end_time')}
							/>

						</Grid>
					)}
				</div>
			)}

		</Section>
	);

	//
}
