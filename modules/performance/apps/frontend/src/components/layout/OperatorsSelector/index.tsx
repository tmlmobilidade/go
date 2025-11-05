/* * */

import StatusCircle from '@/components/layout/StatusCircle';
import { OPERATORS } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { Skeleton } from '@go/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import styles from './styles.module.css';

export default function OperatorsSelector() {
	//

	// A. Setup variables

	const homeContext = useHomeContext();
	const selectedOperator = homeContext.data.selected_operator;

	const t = useTranslations();

	//
	// B. Transform data

	const operatorsData = useMemo(() =>
		Object.values(OPERATORS)
			.filter(value => homeContext.data.systemStatuses?.[value])
			.map(value => ({
				key: value,
				label: t(`operators.${value}`),
				systemStatus: homeContext.data.systemStatuses[value].status,
			})),
	[homeContext.data.systemStatuses, t]);

	// C. Render components

	return (
		<div className={styles.operatorsContainer}>

			{operatorsData.length ? (
				<>
					{operatorsData.map(({ key, label, systemStatus }) => (
						<div key={key} className={`${styles.operator} ${selectedOperator !== key ? styles.mutedOperator : ''}`} onClick={() => homeContext.actions.setSelectedOperator(key)}>
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
