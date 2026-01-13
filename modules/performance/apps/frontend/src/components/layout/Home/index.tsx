/* * */

import AgenciesStatus from '@/components/layout/AgenciesStatus';
import SystemStatus from '@/components/layout/SystemStatus';
import Topics from '@/components/layout/Topics';
import { Widget } from '@/components/layout/Widget';
import { RealtimeDemand } from '@/components/visualizations/RealtimeDemand';
import { ServiceCompliance } from '@/components/visualizations/ServiceCompliance';
import { Divider, Grid, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

export default function Home() {
	//

	// A. Setup variables

	const me = useMeContext();
	const userName = me.data.user.first_name;
	const { t } = useTranslation();

	//
	// B. Transform data

	// C. Render components

	return (
		<div className={styles.container}>

			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<h1 className={styles.headerTitle}>{t('performance:layout.Home.greeting', { defaultValue: '', name: userName })}</h1>
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
}

//
