/* * */

'use client';

import { HeaderActions, HeaderActionsMobile } from '@/components/common/layout/Header/HeaderActions';
import { HeaderLinks, HeaderLinksMobile } from '@/components/common/layout/Header/HeaderLinks';
import { HeaderLogo } from '@/components/common/layout/Header/HeaderLogo';
import { IconMenu } from '@tabler/icons-react';
import { IconButton } from '@tmlmobilidade/ui';
import { useState } from 'react';

import styles from './styles.module.css';

/* * */

export function Header() {
	//
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	//
	// A. Render components

	return (
		<div className={styles.headerWrapper}>
			<div className={styles.headerInner}>
				<HeaderLogo />
				<HeaderLinks />
				<HeaderActions />
				<div className={styles.mobileMenuToggle}>
					<IconButton icon={<IconMenu />} onClick={() => setIsMobileMenuOpen(prev => !prev)} />
				</div>
			</div>
			<div className={`${styles.mobilePanel} ${isMobileMenuOpen ? styles.mobilePanelOpen : ''}`}>
				<HeaderLinksMobile onMobileNavigate={() => setIsMobileMenuOpen(false)} />
				<HeaderActionsMobile />
			</div>
		</div>
	);

	//
}
