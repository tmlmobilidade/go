import { ReactNode } from 'react';

import styles from './styles.module.css';

interface ComponentWrapperProps {
	children: ReactNode
	className?: string
}

export default function ComponentWrapper({ children, className }: ComponentWrapperProps) {
	return (
		<div className={`${styles.container} ${className || ''}`}>
			<div className={styles.background} />
			<div className={styles.content}>{children}</div>
		</div>
	);
};
