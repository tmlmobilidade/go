'use client';

import { EventsRulesCreateBasicInfo } from '@/components/events/rules/EventsRulesCreateBasicInfo';
import { EventsRulesCreateFooter } from '@/components/events/rules/EventsRulesCreateFooter';
import { EventsRulesCreateHeader } from '@/components/events/rules/EventsRulesCreateHeader';

import styles from './styles.module.css';

/* * */

export function EventsRulesCreate() {
	return (
		<div className={styles.container}>
			<div className={styles.mainContent}>
				<div className={styles.header}>
					<EventsRulesCreateHeader />
				</div>
				<div className={styles.content}>
					<EventsRulesCreateBasicInfo />
				</div>
				<div className={styles.footer}>
					<EventsRulesCreateFooter />
				</div>
			</div>
		</div>
	);
}
