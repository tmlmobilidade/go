'use client';

import Button from '@/components/common/Button';
import { TransportOption, useGlobalSettingsContext } from '@/contexts/GlobalSettings.context';
import { Group } from '@mantine/core';

/* * */

export function HomePageFilterbarTransports() {
	const { actions, filterbar } = useGlobalSettingsContext();

	const transportOptions: { label: string, value: TransportOption }[] = [
		{ label: 'Autocarro', value: 'bus' },
		{ label: 'Metro', value: 'metro' },
		{ label: 'Comboio', value: 'train' },
		{ label: 'Barco', value: 'boat' },
	];

	return (
		<Group>
			{transportOptions.map((opt) => {
				const active = filterbar.transports.includes(opt.value);

				return (
					<Button
						key={opt.value}
						label={opt.label}
						variant={active ? 'primary' : 'default'}
						onClick={() => {
							if (active) {
								actions.updateTransports(filterbar.transports.filter(v => v !== opt.value));
							}
							else {
								actions.updateTransports([...filterbar.transports, opt.value]);
							}
						}}
					/>
				);
			})}
		</Group>
	);
}
