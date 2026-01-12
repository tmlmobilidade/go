/* * */

import SystemStatus from '@/components/layout/SystemStatus';
import { RealtimeDemand } from '@/components/visualizations/RealtimeDemand';
import { ServiceCompliance } from '@/components/visualizations/ServiceCompliance';
import { AgencyType } from '@/constants';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

export default function AreasHome({ agency }: { agency: AgencyType }) {
	//

	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Handle actions

	// C. Render components

	return (
		<div className={styles.container}>
			<div className={styles.topContainer}>
				<div className={styles.headerContainer}>
					<h2 className={styles.title}>{t(`performance:agencies.${agency}`)}</h2>
					<SystemStatus agency={agency} />
				</div>

			</div>

			<RealtimeDemand agency={agency} />

			<ServiceCompliance agency={agency} />

		</div>
	);
}

//
