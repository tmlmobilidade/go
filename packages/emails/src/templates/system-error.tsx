/* * */

import { Paragraph } from '@/components/Paragraph/index.js';
import { Span } from '@/components/Span/index.js';
import { Wrapper } from '@/components/Wrapper/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { render } from 'react-email';

/* * */

export const failedBackupSubject = '🚨 Erro de Sistema';

/* * */

export interface SystemErrorTemplateProps {
	errorMessage?: string
	serviceName: string
	timestamp: UnixTimestamp
}

/* * */

export default function SystemErrorTemplate({ errorMessage, serviceName, timestamp }: SystemErrorTemplateProps) {
	return (
		<Wrapper previewMessage="Por favor verifica o que se passou.">
			<Paragraph bold color="danger">Ocorreu um erro de sistema.</Paragraph>
			<Paragraph bold size="md">
				Serviço:
				<Span spaceBefore weight="normal">{serviceName}</Span>
			</Paragraph>
			<Paragraph bold size="md">
				Mensagem:
				<Span spaceBefore weight="normal">{errorMessage ?? 'N/A'}</Span>
			</Paragraph>
			<Paragraph bold size="md">
				Timestamp:
				<Span spaceBefore weight="normal">{Dates.fromUnixTimestamp(timestamp).toLocaleString(Dates.FORMATS.DATETIME_FULL_WITH_SECONDS)}</Span>
			</Paragraph>
		</Wrapper>
	);
};

/* * */

SystemErrorTemplate.PreviewProps = {
	errorMessage: 'Conexão com a base de dados falhou após 3 tentativas',
	serviceName: 'MongoDB - Produção',
	timestamp: 1772279176000 as UnixTimestamp,
} satisfies SystemErrorTemplateProps;

/* * */

export const renderSystemErrorTemplate = async (props: SystemErrorTemplateProps) => {
	return await render(<SystemErrorTemplate {...props} />);
};

/* * */

export const sendSystemErrorEmail = async ({ data, to }: SendEmailProps<SystemErrorTemplateProps>) => {
	await emailProvider.send({
		html: await renderSystemErrorTemplate(data),
		subject: failedBackupSubject,
		to: to,
	});
};
