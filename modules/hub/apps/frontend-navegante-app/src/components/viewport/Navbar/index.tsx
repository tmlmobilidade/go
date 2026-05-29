'use client';

import { AlertsList } from '@/components/alerts/AlertsList';
import { LinesList } from '@/components/lines/list/LinesList';
import { StopsList } from '@/components/stops/list/StopsList';
import { useTransitModes } from '@/hooks/use-transit-modes';
import { Tabs } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconBuildingTunnel, IconBus, IconFerry, IconTrain } from '@tabler/icons-react';
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

	const { activeTransitModes, availableTransitModes, toggleTransitMode } = useTransitModes();

	//
	// B. Render components

	return (
		<Tabs
			classNames={{ panel: styles.panel, root: styles.root, tab: styles.tab, tabLabel: styles.tabLabel }}
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

			<div className={styles.transitModesBar}>
				{availableTransitModes.map(mode => (
					<div
						key={mode}
						className={styles.transitModeButton}
						data-active={activeTransitModes.includes(mode)}
						onClick={() => toggleTransitMode(mode)}
					>
						{mode === 'bus' && <IconBus size={24} />}
						{mode === 'subway' && <IconBuildingTunnel size={24} />}
						{mode === 'train' && <IconTrain size={24} />}
						{mode === 'ferry' && <IconFerry size={24} />}
					</div>
				))}
			</div>

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
