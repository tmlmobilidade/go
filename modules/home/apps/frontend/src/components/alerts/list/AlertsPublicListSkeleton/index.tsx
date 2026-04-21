/* * */
import { Skeleton } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function AlertsPublicListSkeleton() {
	//

	//
	// A. Render components

	return (
		<div className={styles.skeletonWrapper}>
			{Array.from({ length: 3 }).map((_, idx) => (
				<article key={idx} className={styles.card}>
					<div className={styles.header}>
						<Skeleton height={28} width={28} circle />
						<div className={styles.main}>
							<Skeleton height={18} width="55%" />
							<Skeleton height={14} width="95%" />
							<Skeleton height={14} width="80%" />
						</div>
					</div>
				</article>
			))}

		</div>

	);

	//
}
