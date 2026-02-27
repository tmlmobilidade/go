/* * */

import { EmailWrapper, styles } from '@/components/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { Button, Hr, Link, render, Section, Text } from '@react-email/components';
import { getAppConfig } from '@tmlmobilidade/consts';

/* * */

export const welcomeSubject = 'Bem-vindo ao GO!';

/* * */

export interface WelcomeTemplateProps {
	firstName: string
	resetPasswordUrl: string
}

/* * */

export default function WelcomeTemplate({ firstName, resetPasswordUrl }: WelcomeTemplateProps) {
	//

	const go_link = getAppConfig('auth', 'frontend_url', 'production');

	return (
		<EmailWrapper preview="Bem-vindo ao GO - Gestor de Oferta">
			<Section>
				<Text style={styles.text}>
					👋 Olá
					{' '}
					{firstName}
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

				<Button href={resetPasswordUrl} style={styles.button}>
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

/* * */

WelcomeTemplate.PreviewProps = {
	firstName: 'Josué',
	resetPasswordUrl: 'https://www.tmlmobilidade.pt/setup-password',
} satisfies WelcomeTemplateProps;

/* * */

export const renderWelcomeTemplate = async (props: WelcomeTemplateProps) => {
	return await render(<WelcomeTemplate {...props} />);
};

/* * */

export const sendWelcomeEmail = async ({ data, to }: SendEmailProps<WelcomeTemplateProps>) => {
	await emailProvider.send({
		html: await renderWelcomeTemplate(data),
		subject: welcomeSubject,
		to: to,
	});
};
