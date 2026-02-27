/* * */

import { EmailWrapper, HighlightText, InfoBox, styles } from '@/components/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { Button, Hr, render, Section, Text } from '@react-email/components';

/* * */

export const resetPasswordSubject = 'Redefinição da sua palavra-passe';

/* * */

export interface ResetPasswordTemplateProps {
	firstName: string
	resetPasswordUrl: string
}

/* * */

export default function ResetPasswordTemplate({ firstName, resetPasswordUrl }: ResetPasswordTemplateProps) {
	return (
		<EmailWrapper preview="Redefinição da sua palavra-passe">
			<Section>
				<Text style={styles.text}>
					👋 Olá
					{' '}
					{firstName}
					,
				</Text>

				<Text style={styles.text}>
					Recebemos um pedido para redefinir a palavra-passe associada à sua conta no
					{' '}
					<strong>GO (Gestor de Oferta)</strong>
					.
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<InfoBox variant="warning">
					<Text style={{ ...styles.text, fontWeight: '600', margin: '0 0 12px 0' }}>
						🔒 Redefinição de Palavra-passe
					</Text>

					<Text style={{ ...styles.text, margin: '8px 0' }}>
						Se foi você que solicitou esta redefinição, clique no botão abaixo para criar uma nova palavra-passe:
					</Text>
				</InfoBox>

				<Button href={resetPasswordUrl} style={styles.button}>
					Redefinir Palavra-passe
				</Button>

				<Hr style={{ margin: '24px 0' }} />

				<Text style={styles.text}>
					<strong>Informações importantes:</strong>
				</Text>

				<Text style={styles.text}>
					•
					{' '}
					<HighlightText variant="warning">Este link é válido por apenas 1 hora</HighlightText>
					<br />
					• Após este período, será necessário solicitar um novo link
					<br />
					• O link só pode ser usado uma vez
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<InfoBox variant="error">
					<Text style={{ ...styles.text, fontWeight: '600', margin: '0 0 12px 0' }}>
						⚠️ Medidas de Segurança
					</Text>

					<Text style={{ ...styles.text, margin: '8px 0' }}>
						<HighlightText variant="error">Não foi você que fez este pedido?</HighlightText>
						<br />
						Se não solicitou esta redefinição, pode ignorar este e-mail com segurança. A sua palavra-passe atual continuará válida e inalterada.
					</Text>

					<Text style={{ ...styles.text, margin: '8px 0' }}>
						<strong>Para manter a sua conta segura:</strong>
						<br />
						• Não partilhe este e-mail com ninguém
						<br />
						• Não encaminhe esta mensagem
						<br />
						• Verifique sempre o remetente dos e-mails
					</Text>
				</InfoBox>

				<Hr style={{ margin: '24px 0' }} />

				<Text style={styles.text}>
					<strong>Após redefinir a palavra-passe:</strong>
				</Text>

				<Text style={styles.text}>
					1.
					{' '}
					<strong>Escolha uma palavra-passe segura</strong>
					{' '}
					- Use uma combinação de letras, números e símbolos
					<br />
					2.
					{' '}
					<strong>Não reutilize palavras-passe</strong>
					{' '}
					- Use uma palavra-passe única para esta conta
					<br />
					3.
					{' '}
					<strong>Mantenha-a confidencial</strong>
					{' '}
					- Nunca partilhe a sua palavra-passe com terceiros
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<Text style={styles.textStyles.muted}>
					Se continuar a ter problemas com o acesso à sua conta ou suspeitar de atividade não autorizada, contacte imediatamente a nossa equipa de suporte.
				</Text>

				<Text style={{ ...styles.textStyles.muted, fontWeight: '500' }}>
					Obrigado por manter a sua conta segura!
				</Text>
			</Section>
		</EmailWrapper>
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
