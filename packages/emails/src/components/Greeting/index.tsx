/* * */

import { Text } from '@react-email/components';

import styles from './styles.js';

/* * */

export interface GreetingProps {
	text?: string
}

/* * */

export function Greeting({ text = 'Olá,' }: GreetingProps) {
	return (
		<Text style={styles.text}>
			{text}
		</Text>
	);
};
