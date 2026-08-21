/* * */

import { GO_HOMEPAGE_URL } from '@/constants.js';
import { Link, Section, Text } from 'react-email';

import styles from './styles.js';

/* * */

export function Disclaimer() {
	return (
		<Section style={styles.section}>
			<Text style={styles.text}>
				Esta mensagem foi enviada automaticamente. Verifica sempre o email do remetente antes de carregares em qualquer link ou introduzires informações pessoais em qualquer site. Fala connosco se precisares de mais informações ou se achares que recebeste esta mensagem por engano. Acede a
				{' '}
				<Link href={GO_HOMEPAGE_URL} style={styles.link}>{GO_HOMEPAGE_URL}</Link>
			</Text>
		</Section>
	);
};
