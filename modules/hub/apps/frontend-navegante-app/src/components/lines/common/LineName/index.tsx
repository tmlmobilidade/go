/* * */

import { type HubLine } from '@tmlmobilidade/go-types-public-info';
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
		<MantineHighlight classNames={{ root: styles.name }} component="span" data-align={align} data-size={size} highlight={searchQuery || ''}>
			{text}
		</MantineHighlight>
	);
}
