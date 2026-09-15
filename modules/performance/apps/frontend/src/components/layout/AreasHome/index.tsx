'use client';

/* * */

import { SystemStatus } from '@/components/layout/SystemStatus';
import { RealtimeDemand } from '@/components/visualizations/RealtimeDemand';
import { ServiceCompliance } from '@/components/visualizations/ServiceCompliance';
import { type AgencyType } from '@/constants';
import { useTranslations } from 'next-intl';

import styles from './styles.module.css';

/* * */

export function AreasHome({ agency }: { agency: AgencyType }) {
	//

	// A. Setup variables

	const t = useTranslations();

	//
	// B. Handle actions

	// C. Render components

	return (
		<div className={styles.container}>
			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<h2 className={styles.title}>{t(`agencies.${agency}`)}</h2>
					<SystemStatus agency={agency} />
				</div>

			</div>

			<RealtimeDemand agency={agency} />

			<ServiceCompliance agency={agency} />

		</div>
	);
}

//
