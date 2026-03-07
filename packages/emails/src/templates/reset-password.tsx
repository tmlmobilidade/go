/* * */

import { Greeting } from '@/components/Greeting/index.js';
import { MainButton } from '@/components/MainButton/index.js';
import { Paragraph } from '@/components/Paragraph/index.js';
import { Wrapper } from '@/components/Wrapper/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { render } from '@react-email/components';

/* * */

export const resetPasswordSubject = 'Recuperação de palavra-passe';

/* * */

export interface ResetPasswordTemplateProps {
	firstName: string
	resetPasswordUrl: string
}

/* * */

export default function ResetPasswordTemplate({ firstName, resetPasswordUrl }: ResetPasswordTemplateProps) {
	return (
		<Wrapper previewMessage="Instruções para recuperares a tua palavra-passe.">
			<Greeting text={`Olá ${firstName} 👋`} />
			<Paragraph>Recebemos um pedido para recuperar a palavra-passe da tua conta do GO.</Paragraph>
			<Paragraph>Se iniciaste este pedido, utiliza o botão seguinte para redefinir a tua palavra-passe.</Paragraph>
			<MainButton href={resetPasswordUrl} label="Definir Palavra-passe" />
			<Paragraph bold color="danger">Se não fizeste este pedido, por favor ignora este e-mail.</Paragraph>
			<Paragraph>A tua palavra-passe atual permanecerá válida e inalterada. Não partilhes o conteúdo deste email com ninguém.</Paragraph>
			<Paragraph>Se continuares a ter dificuldades em aceder à tua conta ou suspeitares de atividade não autorizada, entra imediatamente em contacto connosco.</Paragraph>
		</Wrapper>
	);
};

/* * */

ResetPasswordTemplate.PreviewProps = {
	firstName: 'Josué',
	resetPasswordUrl: 'https://www.tmlmobilidade.pt/reset-password',
} satisfies ResetPasswordTemplateProps;

/* * */

export const renderResetPasswordTemplate = async (props: ResetPasswordTemplateProps) => {
	return await render(<ResetPasswordTemplate {...props} />);
};

/* * */

export const sendResetPasswordEmail = async ({ data, to }: SendEmailProps<ResetPasswordTemplateProps>) => {
	await emailProvider.send({
		html: await renderResetPasswordTemplate(data),
		subject: resetPasswordSubject,
		to: to,
	});
};
