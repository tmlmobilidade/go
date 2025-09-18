/* * */

import styles from './styles.module.css';

/* * */

export function RideDetailAcceptanceCommentItemWrapper({ children, icon }: { children: React.ReactNode, icon: React.ReactNode }) {
	return (
		<div className={styles.item}>
			<div className={styles.itemWrapper}>
				<div className={styles.icon}>
					{icon}
				</div>
				<div className={styles.path} />
			</div>
			{children}
		</div>
	);
}
