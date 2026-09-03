/* * */

import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { render } from 'react-email';

import { Paragraph } from '../components/Paragraph/index.js';
import { Span } from '../components/Span/index.js';
import { Wrapper } from '../components/Wrapper/index.js';
import { emailProvider } from '../email.provider.js';
import { type SendEmailProps } from '../types.js';

/* * */

export const failedBackupSubject = '🚨 Erro de Sistema';

/* * */

export interface SystemErrorTemplateProps {
	errorMessage?: string
	serviceName: string
	timestamp: UnixMilliseconds
}

/* * */

export default function SystemErrorTemplate({ errorMessage, serviceName, timestamp }: SystemErrorTemplateProps) {
	return (
		<Wrapper previewMessage="Por favor verifica o que se passou.">
			<Paragraph color="danger" bold>Ocorreu um erro de sistema.</Paragraph>
			<Paragraph size="md" bold>
				Serviço:
				<Span weight="normal" spaceBefore>{serviceName}</Span>
			</Paragraph>
			<Paragraph size="md" bold>
				Mensagem:
				<Span weight="normal" spaceBefore>{errorMessage ?? 'N/A'}</Span>
			</Paragraph>
			<Paragraph size="md" bold>
				Timestamp:
				<Span spaceBefore weight="normal">{Dates.fromUnixMilliseconds(timestamp).toFormat('yyyy-MM-dd HH:mm:ss')}</Span>
			</Paragraph>
		</Wrapper>
	);
};

/* * */

SystemErrorTemplate.PreviewProps = {
	errorMessage: 'Conexão com a base de dados falhou após 3 tentativas',
	serviceName: 'MongoDB - Produção',
	timestamp: 1772279176000 as UnixMilliseconds,
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
