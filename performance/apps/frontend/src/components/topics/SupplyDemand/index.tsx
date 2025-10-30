/* * */

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { DemandByAgencyByDay } from '@/components/visualizations/DemandByAgencyByDay';

import styles from './styles.module.css';

export default function SupplyDemandTopic() {
	//

	// A. Setup variables

	//
	// B. Transform data

	// C. Render components

	return (
		<div className={styles.container}>
			<ContainerWrapper>
				<DemandByAgencyByDay chartType="line" height={400} />
			</ContainerWrapper>
		</div>
	);
}

//
