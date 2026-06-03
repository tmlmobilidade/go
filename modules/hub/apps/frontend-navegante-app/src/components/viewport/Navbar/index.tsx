'use client';

import { AlertsList } from '@/components/alerts/list/AlertsList';
import { LinesList } from '@/components/lines/list/LinesList';
import { StopsList } from '@/components/stops/list/StopsList';
import { TransitModesBar } from '@/components/viewport/TransitModesBar';
import { Tabs } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function Navbar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [activeTab, setActiveTab] = useLocalStorage({
		defaultValue: 'stops',
		key: 'active-tab',
	});

	//
	// B. Render components

	return (
		<Tabs
			classNames={{ list: styles.list, panel: styles.panel, root: styles.root, tab: styles.tab, tabLabel: styles.tabLabel }}
			color="transparent"
			onChange={setActiveTab}
			radius="xs"
			value={activeTab}
		>

			<Tabs.List grow>
				<Tabs.Tab value="lines">{t('default:viewport.Navbar.tabs.lines')}</Tabs.Tab>
				<Tabs.Tab value="stops">{t('default:viewport.Navbar.tabs.stops')}</Tabs.Tab>
				<Tabs.Tab value="alerts">{t('default:viewport.Navbar.tabs.alerts')}</Tabs.Tab>
			</Tabs.List>

			<TransitModesBar />

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
