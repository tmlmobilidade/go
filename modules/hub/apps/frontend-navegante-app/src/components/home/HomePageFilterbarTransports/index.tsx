'use client';

import TextPopover from '@/components/common/TextPopover';
import { TransportOption, useGlobalSettingsContext } from '@/contexts/GlobalSettings.context';
import { transportsSelectionIsAll } from '@/utils/transportAgencies';
import { Group } from '@mantine/core';
import { IconApps, IconBuildingTunnel, IconBus, IconFerry, IconTrain } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import styles from './styles.module.css';

/* * */

export function HomePageFilterbarTransports() {
	//

	//
	// A. Setup variables

	const t = useTranslations('home.HomePageFilterbar.transports');
	const { actions, filterbar } = useGlobalSettingsContext();

	const allSelected = transportsSelectionIsAll(filterbar.transports);

	//
	// B. Transform data

	const transportOptions: { icon: React.ReactNode, labelKey: TransportOption }[] = [
		{ icon: <IconBus size={24} />, labelKey: 'bus' },
		{ icon: <IconBuildingTunnel size={24} />, labelKey: 'metro' },
		{ icon: <IconTrain size={24} />, labelKey: 'train' },
		{ icon: <IconFerry size={24} />, labelKey: 'boat' },
	];

	//
	// C. Handle actions

	const handleAllClick = () => {
		actions.toggleTransportOption('all');
	};

	const handleTransportClick = (transport: TransportOption) => {
		actions.toggleTransportOption(transport);
	};

	//
	// D. Render components

	return (
		<div className={styles.transportsWrapper}>
			<TextPopover text={t('all')} textSize="md">
				<div className={`${styles.icon} ${allSelected ? styles.iconActive : ''}`} onClick={handleAllClick}>
					<IconApps size={24} />
				</div>
			</TextPopover>
			{transportOptions.map((opt) => {
				const active = allSelected || filterbar.transports.includes(opt.labelKey);
				return (
					<TextPopover key={opt.labelKey} text={t(opt.labelKey)} textSize="md">
						<div className={`${styles.icon} ${active ? styles.iconActive : ''}`} onClick={() => handleTransportClick(opt.labelKey)}>
							{opt.icon}
						</div>
					</TextPopover>
				);
			})}

		</div>
	);
}
