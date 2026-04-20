/* * */

'use client';

import { HeaderActions } from '@/components/common/layout/Header/HeaderActions';
import { HeaderLinks } from '@/components/common/layout/Header/HeaderLinks';
import { HeaderLogo } from '@/components/common/layout/Header/HeaderLogo';
import { IconMenu } from '@tabler/icons-react';
import { IconButton } from '@tmlmobilidade/ui';
import Link from 'next/link';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export function Header() {
	//
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	//
	// A. Render components

	return (
		<div className={`${styles.headerWrapper} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
			<div className={styles.headerInner}>
				<HeaderLogo />
				<HeaderLinks />
				<HeaderActions />
				<div className={styles.mobileMenuToggle}>
					<IconButton icon={<IconMenu />} onClick={() => setIsMobileMenuOpen(prev => !prev)} />
				</div>
			</div>
			<div className={styles.mobilePanel}>
				<Link className={styles.mobilePanelLink} href="https://go.tmlmobilidade.pt/reference" onClick={() => setIsMobileMenuOpen(false)}>
					Documentação
				</Link>
			</div>
		</div>
	);

	//
}
