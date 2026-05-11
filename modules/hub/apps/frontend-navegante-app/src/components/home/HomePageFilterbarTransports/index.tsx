'use client';

import TextPopover from '@/components/common/TextPopover';
import { TransportOption, useGlobalSettingsContext } from '@/contexts/GlobalSettings.context';
import { Group } from '@mantine/core';
import { IconBuildingTunnel, IconBus, IconFerry, IconTrain } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

export function HomePageFilterbarTransports() {
	//

	//
	// A. Setup variables

	const { actions, filterbar } = useGlobalSettingsContext();

	//
	// B. Transform data

	const transportOptions: { icon: React.ReactNode, label: string, value: TransportOption }[] = [
		{ icon: <IconBus size={24} />, label: 'Autocarro', value: 'bus' },
		{ icon: <IconBuildingTunnel size={24} />, label: 'Metro', value: 'metro' },
		{ icon: <IconTrain size={24} />, label: 'Comboio', value: 'train' },
		{ icon: <IconFerry size={24} />, label: 'Barco', value: 'boat' },
	];

	//
	// C. Handle actions

	const handleTransportClick = (transport: TransportOption) => actions.toggleTransport(transport);

	//
	// D. Render components

	return (
		<Group>
			{transportOptions.map((opt) => {
				const active = filterbar.transports.includes(opt.value);

				return (
					<TextPopover key={opt.value} text={opt.label} textSize="md">
						<div className={`${styles.icon} ${active ? styles.iconActive : ''}`} onClick={() => handleTransportClick(opt.value)}>
							{opt.icon}
						</div>
					</TextPopover>
				);
			})}
		</Group>
	);
}
