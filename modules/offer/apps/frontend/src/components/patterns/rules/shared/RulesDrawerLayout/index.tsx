'use client';

import { IconCaretLeftFilled, IconCaretRightFilled } from '@tabler/icons-react';
import { CloseButton } from '@tmlmobilidade/ui';
import { type PropsWithChildren, type ReactNode, useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface RulesDrawerLayoutProps {
	drawerContent: ReactNode
	drawerHeader: ReactNode
	drawerSize?: 'compact' | 'full'
	isAvailable?: boolean
	isOpen: boolean
	onClose: () => void
	onOpen: () => void
	overlaySidebar?: boolean
	toggleLabel: string
}

/* * */

/** Shared drawer with a blue rail and content preserved after first opening. */
export function RulesDrawerLayout({ children, drawerContent, drawerHeader, drawerSize = 'full', isAvailable = true, isOpen, onClose, onOpen, overlaySidebar = false, toggleLabel }: PropsWithChildren<RulesDrawerLayoutProps>) {
	//
	// A. Setup variables

	const [hasOpened, setHasOpened] = useState(false);
	const isVisible = isAvailable && isOpen;

	//
	// B. Preserve the preview after its first opening

	useEffect(() => {
		if (isVisible) setHasOpened(true);
	}, [isVisible]);

	//
	// C. Render components

	return (
		<div className={styles.container}>
			{isAvailable && (
				<button aria-expanded={isVisible} aria-label={toggleLabel} className={styles.sidebar} data-overlay={overlaySidebar || undefined} onClick={isVisible ? onClose : onOpen} type="button">
					{isVisible ? <IconCaretLeftFilled size={20} /> : <IconCaretRightFilled size={20} />}
				</button>
			)}

			<div className={styles.mainContent}>{children}</div>

			{isVisible && <div className={styles.backdrop} onClick={onClose} />}

			{(hasOpened || isVisible) && (
				<div className={styles.drawer} data-size={drawerSize} hidden={!isVisible}>
					<div className={styles.drawerHeader}>
						<CloseButton onClick={onClose} type="close" />
						{drawerHeader}
					</div>
					<div className={styles.drawerContent}>{drawerContent}</div>
				</div>
			)}
		</div>
	);
}
