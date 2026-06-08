/* * */

import { type HubLine } from '@tmlmobilidade/types';
import { MantineHighlight } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface LineNameProps {
	align?: 'center' | 'left' | 'right'
	lineData?: HubLine
	longName?: string
	searchQuery?: string
	size?: 'lg' | 'md'
}

/* * */

export function LineName({ align = 'left', lineData, longName, searchQuery, size = 'md' }: LineNameProps) {
	const text = lineData?.long_name || longName || '• • •';
	return (
		<div className={styles.name} data-align={align} data-size={size}>
			<MantineHighlight component="span" highlight={searchQuery || ''}>
				{text}
			</MantineHighlight>
		</div>
	);
}
