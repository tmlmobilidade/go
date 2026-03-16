/* * */

import { Button, Section } from '@react-email/components';

import styles from './styles.js';

/* * */

interface MainButtonProps {
	href: string
	label: string
}

/* * */

export function MainButton({ href, label }: MainButtonProps) {
	return (
		<Section style={styles.container}>
			<Section style={styles.section}>
				<Button href={href} style={styles.button}>
					{label}
				</Button>
			</Section>
		</Section>
	);
};
