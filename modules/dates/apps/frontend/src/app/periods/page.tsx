import { PeriodsCalendar } from '@/components/periods/calendar/PeriodsCalendar';
import { EventsCalendarProvider } from '@tmlmobilidade/ui';

/* * */

export default function Page() {
	return (
		<EventsCalendarProvider>
			<PeriodsCalendar />
		</EventsCalendarProvider>
	);
}
