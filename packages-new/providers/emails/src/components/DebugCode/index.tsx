/* * */

import { Text } from 'react-email';

import { Span } from '../Span/index.js';
import styles from './styles.js';

/* * */

export interface DebugCodeProps {
	label?: string
	value: string
}

/* * */

export function DebugCode({ label = 'Olá,', value }: DebugCodeProps) {
	return (
		<Text style={styles.text}>
			{label}
			:
			<Span spaceBefore weight="bold">{value}</Span>
		</Text>
	);
};
