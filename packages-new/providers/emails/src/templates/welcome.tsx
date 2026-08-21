/* * */

import { Anchor } from '@/components/Anchor/index.js';
import { Greeting } from '@/components/Greeting/index.js';
import { MainButton } from '@/components/MainButton/index.js';
import { Paragraph } from '@/components/Paragraph/index.js';
import { Wrapper } from '@/components/Wrapper/index.js';
import { GO_HOMEPAGE_URL } from '@/constants.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { render } from 'react-email';

/* * */

export const welcomeSubject = 'O GO dá-te as boas-vindas!';

/* * */

export interface WelcomeTemplateProps {
	firstName: string
	resetPasswordUrl: string
}

/* * */

export default function WelcomeTemplate({ firstName, resetPasswordUrl }: WelcomeTemplateProps) {
	return (
		<Wrapper previewMessage="Agora vai ser melhor gerir mobilidade.">
			<Greeting text={`Olá ${firstName} 👋`} />
			<Paragraph>É um prazer dar-te as boas vindas ao GO.</Paragraph>
			<Paragraph>Esta plataforma é o resultado de uma enorme vontade de evoluir o setor dos transportes públicos.</Paragraph>
			<Paragraph>
				<Anchor href={GO_HOMEPAGE_URL} spaceAfter text="Na página inicial do GO" />
				encontras documentação útil sobre a plataforma, o GTFS e a API APEX, assim como novidades e outros conteúdos interessantes. Estes recursos são atualizados regularmente e estão disponíveis para consulta a qualquer momento.
			</Paragraph>
			<Paragraph>Comprometemo-nos a ser transparentes e a manter uma atitude de colaboração contigo. Se tiveres alguma dúvida ou sugestão não hesites em falar connosco respondendo a este email.</Paragraph>
			<MainButton href={resetPasswordUrl} label="Definir Palavra-passe" />
			<Paragraph>Para começar a utilizar o GO, clica no botão acima para definir a tua palavra-passe.</Paragraph>
		</Wrapper>
	);
};

/* * */

WelcomeTemplate.PreviewProps = {
	firstName: 'Josué',
	resetPasswordUrl: 'https://go.tmlmobilidade.pt/auth/reset-password',
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
