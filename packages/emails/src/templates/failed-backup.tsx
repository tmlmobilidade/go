/* * */

import { EmailWrapper, HighlightText, InfoBox, styles } from '@/components/index.js';
import { emailProvider } from '@/email.provider.js';
import { SendEmailProps } from '@/types.js';
import { Hr, Section, Text } from '@react-email/components';
import { render } from '@react-email/components';

/* * */

export const failedBackupSubject = 'Falha na execução do backup';

/* * */

export interface FailedBackupProps {
	backupService: string
	errorMessage?: string
	failureTime: string
}

/* * */

export default function FailedBackupTemplate({ backupService, errorMessage, failureTime }: FailedBackupProps) {
	return (
		<EmailWrapper preview="Falha na execução do backup">
			<Section>
				<Text style={styles.text}>
					Atenção!
				</Text>

				<Text style={styles.text}>
					Detetámos uma falha na execução do backup do serviço
					{' '}
					<strong>{backupService}</strong>
					{' '}
					que requer a sua atenção imediata.
				</Text>

				<Hr style={{ margin: '24px 0' }} />

				<InfoBox variant="error">
					<Text style={{ ...styles.text, fontWeight: '600', margin: '0 0 12px 0' }}>
						⚠️ Falha no Backup
					</Text>

					<Text style={{ ...styles.text, margin: '8px 0' }}>
						<strong>Serviço:</strong>
						{' '}
						{backupService}
						<br />
						<strong>Hora da falha:</strong>
						{' '}
						{failureTime}
					</Text>

					{errorMessage && (
						<Text style={{ ...styles.text, margin: '8px 0' }}>
							<strong>Erro:</strong>
							<br />
							<HighlightText variant="error">{errorMessage}</HighlightText>
						</Text>
					)}
				</InfoBox>

			</Section>
		</EmailWrapper>
	);
};

/* * */

FailedBackupTemplate.PreviewProps = {
	backupService: 'MongoDB - Produção',
	errorMessage: 'Conexão com a base de dados falhou após 3 tentativas',
	failureTime: '2024-01-15 02:30:00',
} satisfies FailedBackupProps;

/* * */

export const renderFailedBackupTemplate = async (props: FailedBackupProps) => {
	return await render(<FailedBackupTemplate {...props} />);
};

/* * */

export const sendFailedBackupEmail = async ({ data, to }: SendEmailProps<FailedBackupProps>) => {
	await emailProvider.send({
		html: await renderFailedBackupTemplate(data),
		subject: failedBackupSubject,
		to: to,
	});
};
