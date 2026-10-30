'use client';

import { useCalendarDayCounterContext } from '@/components/calendar/day-counter/CalendarDayCounter.context';
import { CalendarDayCounterCriteria } from '@/components/calendar/day-counter/CalendarDayCounterCriteria';
import { closeCalendarDayCounterModal } from '@/components/calendar/day-counter/CalendarDayCounterModal/CalendarDayCounter.modal';
import { CalendarDayCounterPreview } from '@/components/calendar/day-counter/CalendarDayCounterPreview';
import { Button, CalendarAffectedDaysCount, CloseButton, Label, Pane, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function CalendarDayCounter() {
	//

	//
	// A. Setup variables

	const dayCounterContext = useCalendarDayCounterContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Pane
			footer={[
				<Toolbar key="footer">
					<Button
						label={t('default:calendar.dayCounter.clearCriteria')}
						onClick={dayCounterContext.actions.clearCriteria}
						variant="muted"
					/>
					<Spacer />
					<Button label={t('default:calendar.dayCounter.done')} onClick={closeCalendarDayCounterModal} />
				</Toolbar>,
			]}
			header={[
				<Toolbar key="header">
					<CloseButton onClick={closeCalendarDayCounterModal} type="close" />
					<Section gap="xs" padding="none">
						<Label size="lg">{t('default:calendar.dayCounter.title')}</Label>
						<Text c="dimmed" size="sm">{t('default:calendar.dayCounter.description')}</Text>
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
