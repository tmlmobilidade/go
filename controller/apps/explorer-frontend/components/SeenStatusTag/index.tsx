/* * */

import { type ExtendedRideDisplay } from '@/contexts/Rides.context';

import styles from './styles.module.css';

/* * */

interface Props {
	value?: ExtendedRideDisplay['seen_status']
}

/* * */

export function SeenStatusTag({ value }: Props) {
	return (
		<div className={styles.container} data-status={value}>
			<div className={styles.indicator} />
		</div>
	);
}
