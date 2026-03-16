'use client';

/* * */

import { RuleCreateBasicInfo } from '@/components/events/rules/RuleCreateBasicInfo';
import { RuleCreateFooter } from '@/components/events/rules/RuleCreateFooter';
import { RuleCreateHeader } from '@/components/events/rules/RuleCreateHeader';

import styles from './styles.module.css';

/* * */

export function RuleCreate() {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			{/* Main Content */}
			<div className={styles.mainContent}>
				{/* Header */}
				<div className={styles.header}>
					<RuleCreateHeader />
				</div>

				{/* Scrollable Content */}
				<div className={styles.content}>
					<RuleCreateBasicInfo />
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					<RuleCreateFooter />
				</div>
			</div>

		</div>
	);
}
