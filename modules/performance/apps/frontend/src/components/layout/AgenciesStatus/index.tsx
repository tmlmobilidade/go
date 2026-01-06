/* * */

import StatusCircle from '@/components/layout/StatusCircle';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { useHomeContext } from '@/contexts/Home.context';
import { Skeleton } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

export default function AgenciesStatus() {
	//

	// A. Setup variables

	const { t } = useTranslation('performance');

	const homeContext = useHomeContext();
	const agenciesContext = useAgenciesContext();

	const selectedAgency = homeContext.data.selected_agency;

	//
	// B. Transform data

	const agenciesData = useMemo(() =>
		agenciesContext.data.agenciesWithAll.map((agency) => {
			const systemStatus = agenciesContext.data.systemStatuses[agency.id];
			return {
				systemStatus,
				...agency,
			};
		}),
	[agenciesContext.data.systemStatuses, t]);

	// C. Render components

	return (
		<div className={styles.agenciesContainer}>

			{agenciesData.length ? (
				<>
					{agenciesData.map(({ id, label, systemStatus }) => (
						<div key={id} className={`${styles.agency} ${selectedAgency !== id ? styles.mutedAgency : ''}`} onClick={() => homeContext.actions.setSelectedAgency(id)}>
							<StatusCircle status={systemStatus.status} />
							{label}
						</div>

					),
					)}
				</>
			) : (
				<Skeleton height={40} width="40%" />
			)}
		</div>

	);
}

//
