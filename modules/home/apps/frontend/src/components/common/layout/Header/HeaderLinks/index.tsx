/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button } from '@tmlmobilidade/ui';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

export function HeaderLinks() {
	//

	//
	// A. Render components

	return (
		<div className={styles.headerLinks}>
			<Link href="/alerts">
				<p className={styles.headerActionsLink}> Alertas</p>
			</Link>
			<Link href="https://go.tmlmobilidade.pt/reference">
				<p className={styles.headerActionsLink}> Documentação</p>
			</Link>
			<Button href={PAGE_ROUTES.auth.LOGIN_LIST} label="Entrar" variant="primary" />
		</div>
	);
}

interface HeaderLinksMobileProps {
	onMobileNavigate: () => void
}

export function HeaderLinksMobile({ onMobileNavigate }: HeaderLinksMobileProps) {
	return (
		<>
			<Link className={styles.mobilePanelLink} href="/alerts" onClick={onMobileNavigate}>
				Alertas
			</Link>
			<Link className={styles.mobilePanelLink} href="https://go.tmlmobilidade.pt/reference" onClick={onMobileNavigate}>
				Documentação
			</Link>
		</>
	);
}
