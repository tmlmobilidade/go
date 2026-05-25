'use client';

import { AlertsList } from '@/components/alerts/AlertsList';
import { LinesList } from '@/components/lines/LinesList';
import { StopsList } from '@/components/stops/StopsList';
import { Tabs } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';

import styles from './styles.module.css';

/* * */

export function Navbar() {
	//

	//
	// A. Setup variables

	const [activeTab, setActiveTab] = useLocalStorage({
		defaultValue: 'home',
		key: 'active-tab',
	});

	//
	// B. Transform data

	return (
		<Tabs
			classNames={{ panel: styles.panel, root: styles.root }}
			onChange={setActiveTab}
			value={activeTab}
		>

			<Tabs.List grow>
				<Tabs.Tab value="lines">Linhas</Tabs.Tab>
				<Tabs.Tab value="stops">Paragens</Tabs.Tab>
				<Tabs.Tab value="alerts">Alertas</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value="lines">
				<LinesList />
			</Tabs.Panel>

			<Tabs.Panel value="stops">
				<StopsList />
			</Tabs.Panel>

			<Tabs.Panel value="alerts">
				<AlertsList />
			</Tabs.Panel>

		</Tabs>
	);
}
