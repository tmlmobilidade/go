/* * */

import { Text } from 'react-email';

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
