/* * */

import { Span } from '@/components/Span/index.js';
import { Text } from '@react-email/components';

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
