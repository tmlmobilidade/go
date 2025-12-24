/* * */

import styles from './styles.module.css';

/* * */

export interface LargeButtonProps {
	href?: string
	icon?: React.ReactNode
	isActive?: boolean
	onClick?: () => void
	title: string
}

/* * */

export function LargeButton({ href, icon, isActive, onClick, title }: LargeButtonProps) {
	//

	if (isActive) {
		return (
			<div className={styles.container} data-active>
				<div className={styles.icon}>{icon}</div>
				<p className={styles.title}>{title}</p>
			</div>
		);
	}

	if (href) {
		return (
			<a className={styles.container} href={href} target="_blank">
				<div className={styles.icon}>{icon}</div>
				<p className={styles.title}>{title}</p>
			</a>
		);
	}

	if (onClick) {
		return (
			<div className={styles.container} onClick={onClick}>
				<div className={styles.icon}>{icon}</div>
				<p className={styles.title}>{title}</p>
			</div>
		);
	}

	//
}
