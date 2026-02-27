/* * */

import { Text } from '@react-email/components';
import { type PropsWithChildren } from 'react';

import styles from './styles.js';

/* * */

export function Paragraph({ children }: PropsWithChildren) {
	return (
		<Text style={styles.text}>
			{children}
		</Text>
	);
};
