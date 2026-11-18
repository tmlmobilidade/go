'use client';

import { Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface RuleAsteriskFieldProps {
	children: React.ReactNode
	withAsterisk?: boolean
}

/* * */

export function RuleAsteriskField({ children, withAsterisk }: RuleAsteriskFieldProps) {
	//

	//
	// A. Render components

	return (
		<Text>
			{children}
			{withAsterisk && <span className={styles.asterisk} aria-hidden> *</span>}
		</Text>
	);

	//
}
