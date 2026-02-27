/* * */

import { Link, Section, Text } from '@react-email/components';

import styles from './styles.js';

/* * */

export function Footer() {
	return (
		<Section>
			<Text style={styles.text}>
				Esta mensagem foi enviada automaticamente. Entre em contacto connosco se precisar de mais informações ou se acha que recebeu esta mensagem por engano. Visite o nosso site em
				{' '}
				<Link href="https://spginecologia.pt" style={styles.link}>https://spginecologia.pt</Link>
			</Text>
		</Section>
	);
};
