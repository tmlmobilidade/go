'use client';

/* * */

import { ParameterCreateBasicInfo } from '@/components/patterns/shape/parameters/create/ParameterCreateBasicInfo';
import { ParameterCreateFooter } from '@/components/patterns/shape/parameters/create/ParameterCreateFooter';
import { ParameterCreateHeader } from '@/components/patterns/shape/parameters/create/ParameterCreateHeader';

import styles from './styles.module.css';

/* * */

export function ParameterCreate() {
	//

	//
	// A. Render components

	return (
		<div className={styles.container}>
			{/* Main Content */}
			<div className={styles.mainContent}>
				{/* Header */}
				<div className={styles.header}>
					<ParameterCreateHeader />
				</div>

				{/* Scrollable Content */}
				<div className={styles.content}>
					<ParameterCreateBasicInfo />
				</div>

				{/* Footer */}
				<div className={styles.footer}>
					<ParameterCreateFooter />
				</div>
			</div>

		</div>
	);
}
