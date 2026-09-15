'use client';

import { EventsRulesCreateDates } from '@/components/events/rules/EventsRulesCreateDates';
import { EventsRulesCreateLines } from '@/components/events/rules/EventsRulesCreateLines';
import { EventsRulesCreateWeekdays } from '@/components/events/rules/EventsRulesCreateWeekdays';
import { EventsRulesCreateYearPeriods } from '@/components/events/rules/EventsRulesCreateYearPeriods';
import { IconClockPlay } from '@tabler/icons-react';
import { type EventRule, type HHMM } from '@tmlmobilidade/go-types-offer';
import { Checkbox, Divider, Grid, Section, SegmentedControl, StandardFormController, Switch, Text, TextInput } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

import { ALL_DAY_RESTRICTION_END_TIME, ALL_DAY_RESTRICTION_START_TIME, useEventsRulesCreateFormContext } from '../EventsRulesCreateForm.context';

/* * */

export function EventsRulesCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { form, values } = useEventsRulesCreateFormContext();

	const isRestrictionRule = values.kind === 'event_restriction';
	const isReplacementRule = values.kind === 'event_replacement';

	const isAllDay = values.kind === 'event_restriction' && Boolean(values.all_day);
	const isSameWeekday = values.kind === 'event_replacement' && Boolean(values.same_weekday);

	//
	// B. Handle actions

	const formatTimeInput = (value: string): HHMM => {
		const digits = value.replace(/\D/g, '').slice(0, 4);
		if (digits.length <= 2) return digits as HHMM;
		return `${digits.slice(0, 2)}:${digits.slice(2)}` as HHMM;
	};

	const handleChangeKind = (value: string) => {
		form.setValue('kind', value as EventRule['kind'], { shouldDirty: true, shouldValidate: true });
	};

	const handleToggleAllDay = (e: React.ChangeEvent<HTMLInputElement>) => {
		const enabled = e.currentTarget.checked;
		form.setValue('all_day', enabled, { shouldDirty: true, shouldValidate: true });
		form.setValue('start_time', (enabled ? ALL_DAY_RESTRICTION_START_TIME : '') as HHMM, { shouldDirty: true, shouldValidate: true });
		form.setValue('end_time', (enabled ? ALL_DAY_RESTRICTION_END_TIME : '') as HHMM, { shouldDirty: true, shouldValidate: true });
	};

	const handleToggleSameWeekday = (e: React.ChangeEvent<HTMLInputElement>) => {
		const enabled = e.currentTarget.checked;
		form.setValue('same_weekday', enabled, { shouldDirty: true, shouldValidate: true });
		if (enabled) form.setValue('weekdays', [], { shouldDirty: true, shouldValidate: true });
	};

	//
	// C. Render components

	return (
		<Section gap="md">

			<div className={styles.sectionWrapper}>
				<Text size="lg">1. Tipo de regra</Text>
				<Section gap="sm">
					<SegmentedControl
						onChange={handleChangeKind}
						value={values.kind}
						data={[
							{ label: 'Restrição de oferta', value: 'event_restriction' },
							{ label: 'Substituição de oferta', value: 'event_replacement' },
						]}
					/>
					<Text c="dimmed">{isReplacementRule ? 'Aplicar oferta de outro tipo de dia nestas datas' : 'Esta regra irá remover toda a oferta durante a duração do evento'}</Text>
					<Text c="dimmed" size="sm">{isReplacementRule ? 'Exemplo: O dia 17/02/2026 (terça-feira) passa a funcionar como Sábado · Período Escolar.' : 'Ex: Dia 17/02/26 (terça-feira) tem oferta removida entre as 14h e 18h'}</Text>
				</Section>
			</div>

			<Divider />

			<div className={styles.sectionWrapper}>
				<Text size="lg">2. Que dias serão afetados por esta regra?</Text>
				<EventsRulesCreateDates />
			</div>

			<Divider />

			<div className={styles.sectionWrapper}>
				<Text size="lg">3. Que linhas serão afetadas por esta regra?</Text>
				<EventsRulesCreateLines />
			</div>

			<Divider />

			{isReplacementRule && (
				<div className={styles.sectionWrapper}>
					<Text size="lg">4. Que tipo de oferta se aplica nestes dias?</Text>
					<Text c="dimmed" size="sm">O(s) dia(s) selecionado(s) irão funcionar como:</Text>
					<Section>
						<Switch
							checked={isSameWeekday}
							description="Cada data funciona como o seu próprio dia da semana real, mas no período selecionado. Ex: uma terça-feira funciona como terça-feira · Período de Verão."
							label="Mesmo dia da semana"
							onChange={handleToggleSameWeekday}
						/>
					</Section>
					{!isSameWeekday && <EventsRulesCreateWeekdays />}
					<EventsRulesCreateYearPeriods />
				</div>
			)}

			{isRestrictionRule && (
				<div className={styles.sectionWrapper}>
					<Text size="lg">4. Quando decorre o evento?</Text>
					<Text c="dimmed" size="sm">A oferta é suspensa durante o período definido aqui</Text>
					<Checkbox
						checked={isAllDay}
						label="Evento de dia completo"
						onChange={handleToggleAllDay}
					/>
					{!isAllDay && (
						<Grid columns="ab" gap="sm">
							<StandardFormController
								control={form.control}
								name="start_time"
								render={({ field, fieldState }) => (
									<TextInput
										description="Formato HH:MM no dia operacional. Ex.: 10:00"
										error={fieldState.error?.message}
										label="Hora de início"
										leftSection={<IconClockPlay size={18} />}
										onBlur={field.onBlur}
										onChange={e => field.onChange(formatTimeInput(e.currentTarget.value))}
										value={field.value ?? ''}
									/>
								)}
							/>
							<StandardFormController
								control={form.control}
								name="end_time"
								render={({ field, fieldState }) => (
									<TextInput
										description="Após a meia-noite, usar 24+ horas. Ex.: 02:00 → 26:00"
										error={fieldState.error?.message}
										label="Hora de fim"
										leftSection={<IconClockPlay size={18} />}
										onBlur={field.onBlur}
										onChange={e => field.onChange(formatTimeInput(e.currentTarget.value))}
										value={field.value ?? ''}
									/>
								)}
							/>
						</Grid>
					)}
				</div>
			)}

		</Section>
	);
}
