/* * */

import { Hr, Section, Text } from '@react-email/components';

import styles from './styles.js';

export function Footer() {
	return (
		<>
			<Hr />
			<Section>
				<Text style={styles.footer_text}>
					Este é um e-mail automático — por favor, não responda a esta mensagem.
				</Text>
				<Text style={styles.footer_text}>
					Transportes Metropolitanos de Lisboa
					<br />
					Rua Cruz de Santa Apolónia, 23, 25 e 25 A, 1100-187 Lisboa
				</Text>
			</Section>
		</>
	);
};
