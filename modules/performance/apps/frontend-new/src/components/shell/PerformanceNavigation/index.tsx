'use client';

/* * */

import { NetworkMenu } from '@/components/shell/NetworkMenu';
import { usePerformanceFilterHref } from '@/hooks/usePerformanceFilterHref';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function PerformanceNavigation() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const pathname = usePathname();
	const getFilterHref = usePerformanceFilterHref();

	//
	// B. Setup flags

	const isPulseActive = pathname === '/' || pathname === '/performance-new';

	//
	// C. Render components

	return (
		<nav aria-label={t('navigation.ariaLabel')} className={styles.root}>
			<Link className={styles.link} data-active={isPulseActive} href={getFilterHref('/')}>
				{t('navigation.pulse')}
			</Link>
			<NetworkMenu />
		</nav>
	);

	//
}
