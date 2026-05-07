'use client';
/* * */

import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';
import { useGlobalSettingsContext } from '@/contexts/GlobalSettings.context';
import { useStickyObserver } from '@/hooks/useStickyObserver';
import { ActionIcon, SegmentedControl } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import styles from './styles.module.css';

/* * */

export type HomePageSection = 'alerts' | 'lines' | 'stops' | 'vehicles';

/* * */

export function HomePageHeader({ openFilter }: { openFilter: () => void }) {
	//
	// A. Setup variables

	const t = useTranslations('home.HomePageToolbar');
	const globalSettingsContext = useGlobalSettingsContext();
	const { isSticky, ref: stickyElementRef } = useStickyObserver({ top: '0px' }, [1], { top: -1 });

	//
	// B. Transform data

	const sectionOptions = [
		{ label: t('sections.alerts'), value: 'alerts' },
		{ label: t('sections.lines'), value: 'lines' },
		{ label: t('sections.stops'), value: 'stops' },
		{ label: t('sections.vehicles'), value: 'vehicles' },
	];

	//
	// C. Render Components

	return (
		<header ref={stickyElementRef} className={`${styles.header} ${isSticky ? styles.isSticky : ''}`}>
			<Surface>
				<Section withPadding>
					<div className={styles.toolbarRow}>
						<SegmentedControl
							data={sectionOptions}
							onChange={value => globalSettingsContext.actions.updateSection(value as HomePageSection)}
							style={{ flex: 1 }}
							value={globalSettingsContext.section}
							fullWidth
						/>
						<ActionIcon
							onClick={openFilter}
							size="xl"
							variant="filled"
							classNames={{
								root: styles.filterButton,
							}}
						>
							<IconFilter size={22} />
						</ActionIcon>
					</div>
				</Section>
			</Surface>
		</header>
	);

	//
}
