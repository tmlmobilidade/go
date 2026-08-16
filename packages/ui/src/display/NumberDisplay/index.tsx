/* * */

import { NumberFormatter } from '@mantine/core';

import styles from './styles.module.css';

/* * */

interface NumberDisplayProps {
	decimalScale?: number
	hideZero?: boolean
	prefix?: string
	suffix?: string
	value: number
}

/* * */

export function NumberDisplay({ decimalScale = 2, hideZero = false, prefix, suffix, value }: NumberDisplayProps) {
	//

	if (!value && hideZero) return;

	return (
		<NumberFormatter
			className={styles.numberDisplay}
			data-is-zero={!value}
			decimalScale={decimalScale}
			prefix={prefix}
			suffix={suffix}
			value={value}
		/>
	);
}
