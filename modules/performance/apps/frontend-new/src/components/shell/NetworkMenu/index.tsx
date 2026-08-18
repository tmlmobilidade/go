'use client';

/* * */

import { IconArrowRight, IconChevronDown, IconGitBranch, IconRoute, IconSitemap } from '@tabler/icons-react';
import { Popover } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function NetworkMenu() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const pathname = usePathname();
	const [opened, setOpened] = useState(false);

	//
	// B. Setup flags

	const isActive = pathname.startsWith('/network') || pathname.startsWith('/performance-new/network');

	//
	// C. Render components

	return (
		<Popover offset={0} onChange={setOpened} opened={opened} position="bottom-start" shadow="lg" width={360}>
			<Popover.Target>
				<button className={styles.trigger} data-active={isActive} onClick={() => setOpened(current => !current)} type="button">
					{t('navigation.network.label')}
					<IconChevronDown aria-hidden="true" size={15} />
				</button>
			</Popover.Target>

			<Popover.Dropdown className={styles.dropdown}>
				<nav aria-label={t('navigation.network.ariaLabel')} className={styles.menu}>
					<Link className={styles.item} href="/network" onClick={() => setOpened(false)}>
						<span className={styles.itemIcon}><IconSitemap size={20} /></span>
						<span>
							<strong>{t('navigation.network.overview.title')}</strong>
							<small>{t('navigation.network.overview.description')}</small>
						</span>
						<IconArrowRight aria-hidden="true" size={16} />
					</Link>

					<div className={styles.divider} />
					<p className={styles.groupLabel}>{t('navigation.network.structure')}</p>

					<Link className={styles.item} href="/network/lines" onClick={() => setOpened(false)}>
						<span className={styles.itemIcon}><IconRoute size={20} /></span>
						<span>
							<strong>{t('navigation.network.lines.title')}</strong>
							<small>{t('navigation.network.lines.description')}</small>
						</span>
						<IconArrowRight aria-hidden="true" size={16} />
					</Link>

					<div aria-disabled="true" className={`${styles.item} ${styles.nestedItem}`}>
						<span className={styles.itemIcon}><IconGitBranch size={20} /></span>
						<span>
							<strong>{t('navigation.network.patterns.title')}</strong>
							<small>{t('navigation.network.patterns.description')}</small>
						</span>
					</div>
				</nav>
			</Popover.Dropdown>
		</Popover>
	);

	//
}
