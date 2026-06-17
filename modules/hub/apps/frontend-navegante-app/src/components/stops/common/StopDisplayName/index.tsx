/* * */

import { MantineHighlight } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface Props {
	longName?: string
	searchQuery?: string
	size?: 'lg' | 'md'
}

/* * */

export function StopDisplayName({ longName, searchQuery, size = 'md' }: Props) {
	return longName && (
		<span className={`${styles.name} ${styles[size]}`}>
			<MantineHighlight component="span" highlight={searchQuery || ''}>
				{longName}
			</MantineHighlight>
		</span>
	);
}
