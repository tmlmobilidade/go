/* * */

import { Button } from '@react-email/components';

import styles from './styles.js';

/* * */

interface MainButtonProps {
	href: string
	label: string
}

/* * */

export function MainButton({ href, label }: MainButtonProps) {
	return (
		<Button href={href} style={styles.button}>
			{label}
		</Button>
	);
};
