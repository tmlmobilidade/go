/* * */

import { EmailWrapper, styles } from '@/components/index.js';
import { Button, Hr, Link, Section, Text } from '@react-email/components';
import { getAppConfig } from '@go/lib';

/* * */

export interface WelcomeEmailProps {
	first_name: string
	setup_password_link: string
}

export function WelcomeEmail({ first_name, setup_password_link }: WelcomeEmailProps) {
	const go_link = getAppConfig('auth', 'frontend_url', 'production');

	return (
		<EmailWrapper preview="Bem-vindo ao GO - Gestor de Oferta">
			<Section>
				<Text style={styles.text}>
					👋 Olá
					{' '}
					{first_name}
					,
				</Text>

				<Text style={styles.text}>
					É um prazer dar-lhe as boas-vindas à plataforma
					{' '}
					<strong>GO (Gestor de Oferta)</strong>
					{' '}
					da Transportes Metropolitanos de Lisboa!
				</Text>

				<Text style={styles.text}>
					Para começar a usar o GO, por favor defina uma palavra-passe para a sua conta:
				</Text>

				<Button href={setup_password_link} style={styles.button}>
					Definir Palavra-passe
				</Button>

				<Hr style={{ margin: '24px 0' }} />

				<Text style={styles.textStyles.small}>
					<strong>Já tem uma conta configurada?</strong>
				</Text>

				<Text style={styles.textStyles.small}>
					Pode aceder diretamente ao GO através do seguinte
					{' '}
					<Link href={go_link} style={{ color: '#0369A1', textDecoration: 'underline' }}>
						link.
					</Link>
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<Text style={styles.textStyles.muted}>
					Se tiver alguma dúvida sobre como utilizar a plataforma ou encontrar qualquer dificuldade durante o processo de configuração, não hesite em contactar a nossa equipa de suporte. Estamos aqui para ajudar!
				</Text>
			</Section>
		</EmailWrapper>
	);
};

WelcomeEmail.PreviewProps = {
	first_name: 'Josué',
	setup_password_link: 'https://www.tmlmobilidade.pt/setup-password',
} as WelcomeEmailProps;

export default WelcomeEmail;
