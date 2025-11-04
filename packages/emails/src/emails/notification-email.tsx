/* * */

import { EmailWrapper, InfoBox, styles } from '@/components/index.js';
import { Button, Hr, Section, Text } from '@react-email/components';

/* * */

export interface NotificationEmailProps {
	body: string
	href: string
	priority: string
	scope: string
	title: string
	topic: string
}

/* * */

export function NotificationEmail({ body, href, priority, scope, title, topic }: NotificationEmailProps) {
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

export default NotificationEmail;
