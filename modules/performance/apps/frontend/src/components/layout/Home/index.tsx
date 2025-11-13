/* * */

import AgencySelector from '@/components/layout/AgencySelector';
import SystemStatus from '@/components/layout/SystemStatus';
import Topics from '@/components/layout/Topics';
import { Widget } from '@/components/layout/Widget';
import { RealtimeDemand } from '@/components/visualizations/RealtimeDemand';
import { ServiceCompliance } from '@/components/visualizations/ServiceCompliance';
import { Divider, Grid, useMeContext } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

export default function Home() {
	//

	// A. Setup variables

	const me = useMeContext();
	const userName = me.data.user.first_name;

	//
	// B. Transform data

	// C. Render components

	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<h1 className={styles.headerTitle}>🚀 Olá {userName},</h1>
					<SystemStatus />
					<AgencySelector />
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
}

//
