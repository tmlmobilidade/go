/* * */

import { HeaderActions } from '@/components/common/layout/Header/HeaderActions';
import { HeaderLinks } from '@/components/common/layout/Header/HeaderLinks';
import { HeaderLogo } from '@/components/common/layout/Header/HeaderLogo';

import styles from './styles.module.css';

/* * */

export function Header() {
	//

	//
	// A. Render components

	return (
		<div className={styles.headerWrapper}>
			<div className={styles.headerInner}>
				<HeaderLogo />
				<HeaderLinks />
				<HeaderActions />
			</div>
		</div>
	);

	//
}
