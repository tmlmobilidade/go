/* * */

import { EmailWrapper, HighlightText, InfoBox, styles } from '@/components/index.js';
import { Hr, Section, Text } from '@react-email/components';

/* * */

export interface FailedBackupEmailProps {
	backup_service: string
	error_message?: string
	failure_time: string
}

export function FailedBackupEmail({
	backup_service,
	error_message,
	failure_time,
}: FailedBackupEmailProps) {
	return (
		<EmailWrapper preview="Falha na execução do backup">
			<Section>
				<Text style={styles.text}>
					Atenção!
				</Text>

				<Text style={styles.text}>
					Detetámos uma falha na execução do backup do serviço
					{' '}
					<strong>{backup_service}</strong>
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
						{backup_service}
						<br />
						<strong>Hora da falha:</strong>
						{' '}
						{failure_time}
					</Text>

					{error_message && (
						<Text style={{ ...styles.text, margin: '8px 0' }}>
							<strong>Erro:</strong>
							<br />
							<HighlightText variant="error">{error_message}</HighlightText>
						</Text>
					)}
				</InfoBox>

			</Section>
		</EmailWrapper>
	);
};

FailedBackupEmail.PreviewProps = {
	backup_service: 'MongoDB - Produção',
	dashboard_link: 'https://backups.tmlmobilidade.pt/dashboard',
	error_message: 'Conexão com a base de dados falhou após 3 tentativas',
	failure_time: '2024-01-15 02:30:00',
} as FailedBackupEmailProps;

export default FailedBackupEmail;
