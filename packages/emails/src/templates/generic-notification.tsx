/* * */

import { EmailWrapper, InfoBox, styles } from '@/components/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { Button, Hr, render, Section, Text } from '@react-email/components';

/* * */

export const genericNotificationSubject = 'Nova Notificação';

/* * */

export interface GenericNotificationTemplateProps {
	body: string
	href: string
	priority: string
	title: string
}

/* * */

export default function GenericNotificationTemplate({ body, href, priority, title }: GenericNotificationTemplateProps) {
	//

	//
	// A. Setup variables

	const priorityMap: Record<string, string> = {
		high: 'Alta',
		low: 'Baixa',
		normal: 'Média',
	};

	//
	// B. Render components

	return (
		<EmailWrapper preview="Nova notificação">
			<Section>
				<Text style={styles.text}>
					👋 Olá,
				</Text>

				<Text style={styles.text}>
					Tens uma nova notificação.
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<InfoBox variant="info">
					<Text style={{ ...styles.text, margin: '0 0 12px 0' }}>
						<strong>🔔 Detalhes da Notificação</strong>
					</Text>

					<Text style={{ ...styles.text, margin: '8px 0' }}>
						<strong>Titulo:</strong>
						{' '}
						{title}
						<br />
						<strong>Descrição:</strong>
						{' '}
						{body}
						<br />
						<strong>Prioridade:</strong>
						{' '}
						{priorityMap[priority]}
					</Text>
				</InfoBox>

				<Button href={href} style={styles.button}>
					Ver Notificação
				</Button>

			</Section>
		</EmailWrapper>
	);

	//
};

/* * */

GenericNotificationTemplate.PreviewProps = {
	body: 'Tens uma nova notificação.',
	href: 'https://www.tmlmobilidade.pt',
	priority: 'high',
	title: 'Nova Notificação',
} satisfies GenericNotificationTemplateProps;

/* * */

export const renderGenericNotificationTemplate = async (props: GenericNotificationTemplateProps) => {
	return await render(<GenericNotificationTemplate {...props} />);
};

/* * */

export const sendGenericNotificationEmail = async ({ data, to }: SendEmailProps<GenericNotificationTemplateProps>) => {
	await emailProvider.send({
		html: await renderGenericNotificationTemplate(data),
		subject: genericNotificationSubject,
		to: to,
	});
};
