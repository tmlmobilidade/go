/* * */

import StatusCircle from '@/components/layout/StatusCircle';
import { AGENCIES } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { Skeleton } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import styles from './styles.module.css';

export default function AgencySelector() {
	//

	// A. Setup variables

	const homeContext = useHomeContext();
	const selectedAgency = homeContext.data.selected_agency;

	const t = useTranslations();

	//
	// B. Transform data

	const agenciesData = useMemo(() =>
		Object.values(AGENCIES)
			.filter(value => homeContext.data.systemStatuses?.[value])
			.map(value => ({
				key: value,
				label: t(`agencies.${value}`),
				systemStatus: homeContext.data.systemStatuses[value].status,
			})),
	[homeContext.data.systemStatuses, t]);

	// C. Render components

	return (
		<div className={styles.agenciesContainer}>

			{agenciesData.length ? (
				<>
					{agenciesData.map(({ key, label, systemStatus }) => (
						<div key={key} className={`${styles.agency} ${selectedAgency !== key ? styles.mutedAgency : ''}`} onClick={() => homeContext.actions.setSelectedAgency(key)}>
							<StatusCircle status={systemStatus} />
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
