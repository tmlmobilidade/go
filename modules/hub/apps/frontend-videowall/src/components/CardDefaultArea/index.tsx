/* * */

import { CardDefaultSkeleton } from '@/components/CardDefaultSkeleton';
import { TimestampDisplayArea } from '@/components/TimestampDisplayArea';

import styles from './styles.module.css';

/* * */

interface Props {
	icon?: React.JSX.Element
	isLoading?: boolean
	isValidating?: boolean
	sentiment: 'bad' | 'good' | 'normal'
	size?: 'lg' | 'md' | 'sm'
	timestamp?: number
	title?: string
	valuePrimary?: number | string
	valueSecondary?: number | string
}

/* * */

export function CardDefaultArea({ icon, isLoading = false, isValidating = false, sentiment = 'normal', size = 'lg', timestamp = 0, title = '', valuePrimary = 1, valueSecondary = 1 }: Props) {
	//

	if (isLoading) {
		return (
			<CardDefaultSkeleton />
		);
	}

	return (
		<div className={styles.container} data-sentiment={sentiment} data-size={size} data-validating={isValidating}>

			<div className={styles.headerWrapper}>
				{icon && <div className={styles.headerIcon}>{icon}</div>}
				<p className={styles.headerTitle}>{title}</p>
			</div>

			<div className={styles.contentWrapper}>
				<p className={styles.valuePrimary}>{valuePrimary}</p>
				{valueSecondary && <p className={styles.valueSecondary}>{valueSecondary}</p>}
			</div>

			<div className={styles.footerWrapper}>
				<TimestampDisplayArea timestamp={timestamp} />
			</div>

		</div>
	);

	//
}
