/* * */

import styles from './styles.module.css';

/* * */

interface LargeButtonProps {
	href?: string
	icon?: React.ReactNode
	onClick?: () => void
	title: string
}

/* * */

export function LargeButton({ href, icon, onClick, title }: LargeButtonProps) {
	//

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
