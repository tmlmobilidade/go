'use client';

/* * */

import { StopsDetailContentMap } from '@/components/stops/detail/StopsDetailContentMap';
import { StopsDetailContentTimetable } from '@/components/stops/detail/StopsDetailContentTimetable';
import { StopsDetailContentTimetableHeader } from '@/components/stops/detail/StopsDetailContentTimetableHeader';
import { Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function StopsDetailContent() {
	return (
		<Surface>
			<Section>
				<div className={styles.container}>
					<div className={styles.mapWrapper}>
						<StopsDetailContentMap />
					</div>
					<div className={styles.listWrapper}>
						<StopsDetailContentTimetableHeader />
						<StopsDetailContentTimetable />
					</div>
				</div>
			</Section>
		</Surface>
	);
}
