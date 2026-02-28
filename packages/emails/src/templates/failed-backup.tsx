/* * */

import { Paragraph } from '@/components/Paragraph/index.js';
import { Span } from '@/components/Span/index.js';
import { Wrapper } from '@/components/Wrapper/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { render } from '@react-email/components';

/* * */

export const failedBackupSubject = 'Falha na execução do backup';

/* * */

export interface FailedBackupTemplateProps {
	backupService: string
	errorMessage?: string
	failureTime: string
}

/* * */

export default function FailedBackupTemplate({ backupService, errorMessage, failureTime }: FailedBackupTemplateProps) {
	return (
		<Wrapper previewMessage="Falha na execução do backup">
			<Paragraph bold color="danger">Erro na execução de backup.</Paragraph>
			<Paragraph bold size="md">
				Serviço:
				<Span spaceBefore weight="normal">{backupService}</Span>
			</Paragraph>
			<Paragraph bold size="md">
				Mensagem:
				<Span spaceBefore weight="normal">{errorMessage ?? 'N/A'}</Span>
			</Paragraph>
			<Paragraph bold size="md">
				Timestamp:
				<Span spaceBefore weight="normal">{failureTime}</Span>
			</Paragraph>
		</Wrapper>
	);
};

/* * */

FailedBackupTemplate.PreviewProps = {
	backupService: 'MongoDB - Produção',
	errorMessage: 'Conexão com a base de dados falhou após 3 tentativas',
	failureTime: '2024-01-15 02:30:00',
} satisfies FailedBackupTemplateProps;

/* * */

export const renderFailedBackupTemplate = async (props: FailedBackupTemplateProps) => {
	return await render(<FailedBackupTemplate {...props} />);
};

/* * */

export const sendFailedBackupEmail = async ({ data, to }: SendEmailProps<FailedBackupTemplateProps>) => {
	await emailProvider.send({
		html: await renderFailedBackupTemplate(data),
		subject: failedBackupSubject,
		to: to,
	});
};
