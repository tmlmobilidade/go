/* * */

import SystemStatus from '@/components/layout/SystemStatus';
import { RealtimeDemand } from '@/components/visualizations/RealtimeDemand';
import { ServiceCompliance } from '@/components/visualizations/ServiceCompliance';
import { OperatorType } from '@/constants';
import { Grid } from '@go/ui';
import { useTranslations } from 'next-intl';

import styles from './styles.module.css';

export default function AreasHome({ operator }: { operator: OperatorType }) {
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
					<h1 className={styles.title}>{t(`operators.${operator}`)}</h1>

					<SystemStatus operator={operator} />
				</div>

			</div>

			<Grid columns="a" gap="lg">
				<RealtimeDemand operator={operator} />
			</Grid>

			<ServiceCompliance operator={operator} />

		</div>
	);
}

//
