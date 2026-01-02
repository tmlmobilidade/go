/* * */

import styles from './styles.module.css';

/* * */

export interface LargeButtonProps {
	href?: string
	icon?: React.ReactNode
	isActive?: boolean
	onClick?: () => void
	orientation?: 'horizontal' | 'vertical'
	title: string
}

/* * */

export function LargeButton({ href, icon, isActive, onClick, orientation = 'vertical', title }: LargeButtonProps) {
	//

	if (href) {
		return (
			<a className={styles.container} data-active={isActive} data-orientation={orientation} href={href} target="_blank">
				<div className={styles.icon}>{icon}</div>
				<p className={styles.title}>{title}</p>
			</a>
		);
	}

	if (onClick) {
		return (
			<div className={styles.container} data-active={isActive} data-orientation={orientation} onClick={onClick}>
				<div className={styles.icon}>{icon}</div>
				<p className={styles.title}>{title}</p>
			</div>
		);
	}

	//
}
