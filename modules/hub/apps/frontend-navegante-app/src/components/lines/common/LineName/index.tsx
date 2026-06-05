/* * */

import { type HubLine } from '@tmlmobilidade/types';

import styles from './styles.module.css';

/* * */

interface LineNameProps {
	align?: 'center' | 'left' | 'right'
	lineData?: HubLine
	longName?: string
	size?: 'lg' | 'md'
}

/* * */

export function LineName({ align = 'left', lineData, longName, size = 'md' }: LineNameProps) {
	return (
		<div className={styles.name} data-align={align} data-size={size}>
			{lineData?.long_name || longName || '• • •'}
		</div>
	);
}
