/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Link, Section, Text } from 'react-email';

import styles from './styles.js';

/* * */

export function Disclaimer() {
	return (
		<Section style={styles.section}>
			<Text style={styles.text}>
				Esta mensagem foi enviada automaticamente. Verifica sempre o email do remetente antes de carregares em qualquer link ou introduzires informações pessoais em qualquer site. Fala connosco se precisares de mais informações ou se achares que recebeste esta mensagem por engano. Acede a
				{' '}
				<Link href={PAGE_ROUTES.root.BASE} style={styles.link}>{PAGE_ROUTES.root.BASE}</Link>
			</Text>
		</Section>
	);
};
