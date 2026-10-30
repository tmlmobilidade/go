/* * */

import { render } from 'react-email';

import { Greeting } from '../../components/Greeting/index.js';
import { Paragraph } from '../../components/Paragraph/index.js';
import { Wrapper } from '../../components/Wrapper/index.js';
import { emailProvider } from '../../email.provider.js';
import { type SendEmailProps } from '../../types.js';

/* * */

export const passwordChangedSubject = 'A tua palavra-passe foi alterada';

/* * */

export interface PasswordChangedTemplateProps {
	firstName: string
}

/* * */

export default function PasswordChangedTemplate({ firstName }: PasswordChangedTemplateProps) {
	return (
		<Wrapper previewMessage="A tua palavra-passe foi alterada.">
			<Greeting text={`Olá ${firstName},`} />
			<Paragraph>A tua palavra-passe acabou de ser alterada.</Paragraph>
			<Paragraph>Se foste tu que fizeste esta alteração, ignora este e-mail.</Paragraph>
			<Paragraph bold color="danger">Se não foste tu, entra imediatamente em contacto connosco pois pode representar uma falha de segurança grave.</Paragraph>
		</Wrapper>
	);
};

/* * */

PasswordChangedTemplate.PreviewProps = {
	firstName: 'Josué',
} satisfies PasswordChangedTemplateProps;

/* * */

export const renderPasswordChangedTemplate = async (props: PasswordChangedTemplateProps) => {
	return await render(<PasswordChangedTemplate {...props} />);
};

/* * */

export const sendPasswordChangedEmail = async ({ data, to }: SendEmailProps<PasswordChangedTemplateProps>) => {
	await emailProvider.send({
		html: await renderPasswordChangedTemplate(data),
		subject: passwordChangedSubject,
		to: to,
	});
};
