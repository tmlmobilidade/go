/* * */

import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { IconBrandGithub } from '@tabler/icons-react';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

export function HeaderActions() {
	//

	//
	// A. Render components

	return (
		<div className={styles.headerActions}>
			<ThemeSwitcher />
			<Link href="https://github.com/tmlmobilidade">
				<IconBrandGithub color="var(--color-system-text-200)" size={24} />
			</Link>
		</div>
	);

	//
}

export function HeaderActionsMobile() {
	return (
		<div className={styles.mobileActionsPanel}>
			<ThemeSwitcher />
		</div>
	);
}
