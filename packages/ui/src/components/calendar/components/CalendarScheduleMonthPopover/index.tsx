'use client';

import { Popover, type PopoverProps } from '@mantine/core';
import { type ScheduleProps } from '@mantine/schedule';

import styles from './styles.module.css';

import { type CalendarScheduleMonthPopoverState } from '../CalendarSchedule/useCalendarScheduleMonthPopover';
import { CalendarScheduleDaySummary } from '../CalendarScheduleDaySummary';

/* * */

const MIDDLEWARES = {
	flip: true,
	shift: { padding: 12 },
	size: {
		apply: ({ availableHeight, elements }) => {
			elements.floating.style.setProperty(
				'--calendar-schedule-month-popover-max-height',
				`${Math.max(0, Math.min(availableHeight, 520))}px`,
			);
		},
	},
} satisfies PopoverProps['middlewares'];

/* * */

export interface CalendarScheduleMonthPopoverProps {
	locale: string
	onClose: () => void
	onDismiss: () => void
	onEventClick?: ScheduleProps['onEventClick']
	onKeepOpen: () => void
	state: CalendarScheduleMonthPopoverState
}

/* * */

export function CalendarScheduleMonthPopover({ locale, onClose, onDismiss, onEventClick, onKeepOpen, state }: CalendarScheduleMonthPopoverProps) {
	//

	//
	// A. Render components

	return (
		<Popover
			key={state.date}
			classNames={{ arrow: styles.arrow, dropdown: styles.dropdown }}
			floatingStrategy="fixed"
			middlewares={MIDDLEWARES}
			onChange={opened => !opened && onDismiss()}
			position="top"
			preventPositionChangeWhenVisible={false}
			opened
			withArrow
			withinPortal
		>
			<Popover.Target>
				<span className={styles.target} style={state.target} />
			</Popover.Target>
			<Popover.Dropdown onMouseEnter={onKeepOpen} onMouseLeave={onClose}>
				<CalendarScheduleDaySummary
					date={state.date}
					events={state.events}
					locale={locale}
					onEventClick={onEventClick}
				/>
			</Popover.Dropdown>
		</Popover>
	);

	//
}
