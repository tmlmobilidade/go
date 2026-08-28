'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { CalendarDayCounterCriteria } from '@/components/calendar/day-counter/CalendarDayCounterCriteria';
import { closeCalendarDayCounterModal } from '@/components/calendar/day-counter/CalendarDayCounterModal/CalendarDayCounter.modal';
import { CalendarDayCounterPreview } from '@/components/calendar/day-counter/CalendarDayCounterPreview';
import { Button, CalendarAffectedDaysCount, CloseButton, Label, Pane, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function CalendarDayCounter() {
	//

	//
	// A. Setup variables

	const dayCounterContext = useCalendarDayCounterContext();

	//
	// B. Render components

	return (
		<Pane
			footer={[
				<Toolbar key="footer">
					<Button
						label="Limpar critérios"
						onClick={dayCounterContext.actions.clearCriteria}
						variant="muted"
					/>
					<Spacer />
					<Button label="Concluir" onClick={closeCalendarDayCounterModal} />
				</Toolbar>,
			]}
			header={[
				<Toolbar key="header">
					<CloseButton onClick={closeCalendarDayCounterModal} type="close" />
					<Section gap="xs" padding="none">
						<Label size="lg">Contar dias do calendário</Label>
						<Text c="dimmed" size="sm">Escolha os critérios para calcular os dias afetados.</Text>
					</Section>
					<Spacer />
					<CalendarAffectedDaysCount count={dayCounterContext.data.ruleImpact.count} />
				</Toolbar>,
			]}
		>
			<div className={styles.content}>
				<CalendarDayCounterCriteria />
				<CalendarDayCounterPreview />
			</div>
		</Pane>
	);

	//
}
