/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { useHomeContext } from '@/contexts/Home.context';
import { StatusInfo } from '@/utils/systemStatus';
import { Skeleton, Tooltip } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export default function SystemStatus({ agency }: { agency?: string }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const homeContext = useHomeContext();
	const agenciesContext = useAgenciesContext();

	const selectedAgency = agency || homeContext.data.selected_agency;

	//
	// B. Fetch data

	const systemStatus = agenciesContext.data.systemStatuses[selectedAgency] as StatusInfo | undefined;

	const translationsMap = {
		negative: t('performance:layout.SystemStatus.negative'),
		positive: t('performance:layout.SystemStatus.positive'),
		warning: t('performance:layout.SystemStatus.warning'),
	};

	// C. Render components

	if (!systemStatus) {
		return <Skeleton height={20} width="50%" />;
	}

	const parts = (translationsMap[systemStatus.status] as string).split('*value*');

	// add tooltip
	return (
		<div className={styles.container}>
			<span>
				{parts[0]}
				<Tooltip label={t('performance:layout.SystemStatus.tooltip')} w={400} multiline>
					<span className={styles.statusValue} style={{ color: systemStatus.color }}>
						{systemStatus.value.toFixed(0)}%
					</span>
				</Tooltip>
				{parts[1]}
			</span>
		</div>
	);
}

//
