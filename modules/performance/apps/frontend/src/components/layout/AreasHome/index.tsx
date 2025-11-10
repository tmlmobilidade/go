/* * */

import SystemStatus from '@/components/layout/SystemStatus';
import { RealtimeDemand } from '@/components/visualizations/RealtimeDemand';
import { ServiceCompliance } from '@/components/visualizations/ServiceCompliance';
import { AgencyType } from '@/constants';
import { Grid } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';

import styles from './styles.module.css';

export default function AreasHome({ agency }: { agency: AgencyType }) {
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
					<h1 className={styles.title}>{t(`agencies.${agency}`)}</h1>

					<SystemStatus agency={agency} />
				</div>

			</div>

			<Grid columns="a" gap="lg">
				<RealtimeDemand agency={agency} />
			</Grid>

			<ServiceCompliance agency={agency} />

		</div>
	);
}

//
