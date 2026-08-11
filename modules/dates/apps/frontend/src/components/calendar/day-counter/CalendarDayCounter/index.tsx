'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { CalendarDayCounterCriteria } from '@/components/calendar/day-counter/CalendarDayCounterCriteria';
import { closeCalendarDayCounterModal } from '@/components/calendar/day-counter/CalendarDayCounterModal/CalendarDayCounter.modal';
import { CalendarDayCounterPreview } from '@/components/calendar/day-counter/CalendarDayCounterPreview';
import { Button, CloseButton, CopyButton, Label, Pane, Section, Spacer, Surface, Text, Toolbar, Tooltip } from '@tmlmobilidade/ui';

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
					<CopyButton value={String(dayCounterContext.data.ruleImpact.count)}>
						{({ copied, copy }) => (
							<Tooltip label={copied ? 'Número de dias copiado' : 'Copiar número de dias'} position="bottom" withArrow>
								<button
									aria-label={copied ? 'Número de dias copiado' : 'Copiar número de dias afetados'}
									className={styles.resultButton}
									onClick={copy}
									type="button"
								>
									<Surface align="center" className={styles.result} justify="center" variant="primary" withBackground>
										<Text c="var(--color-primary)" size="xl" weight="bold">{dayCounterContext.data.ruleImpact.count}</Text>
										<Text size="sm" weight="extra-bold">dias afetados</Text>
									</Surface>
								</button>
							</Tooltip>
						)}
					</CopyButton>
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
