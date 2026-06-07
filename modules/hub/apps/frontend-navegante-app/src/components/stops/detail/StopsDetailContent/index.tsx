'use client';

/* * */

import { StopsDetailContentTimetable } from '@/components/stops/detail/StopsDetailContentTimetable';
import { StopsDetailContentTimetableHeader } from '@/components/stops/detail/StopsDetailContentTimetableHeader';
import { Section, Surface } from '@tmlmobilidade/ui';

/* * */

export function StopsDetailContent() {
	return (
		<Surface>
			<Section padding="md">
				{/* <StopsDetailContentTimetableHeader /> */}
				<StopsDetailContentTimetable />
			</Section>
		</Surface>
	);
}
