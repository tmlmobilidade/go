'use client';

/* * */

import { AgenciesStatus } from '@/components/layout/AgenciesStatus';
import { SystemStatus } from '@/components/layout/SystemStatus';
import { Topics } from '@/components/layout/Topics';
import { Widget } from '@/components/layout/Widget';
import { RealtimeDemand } from '@/components/visualizations/RealtimeDemand';
import { ServiceCompliance } from '@/components/visualizations/ServiceCompliance';
import { Divider, Grid, useMeData } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function HomePage() {
	//

	//
	// A. Setup variables

	const { data: meData } = useMeData();
	const userName = meData?.first_name;

	//
	// B. Render components

	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<h1 className={styles.headerTitle}>🚀 Olá {userName},</h1>
					<SystemStatus />
					<AgenciesStatus />
				</div>

				<Widget />
			</div>

			<Grid columns="ab" gap="lg">
				<RealtimeDemand />
				<ServiceCompliance />
			</Grid>

			<Divider />

			<Topics />
		</div>
	);

	//
}
