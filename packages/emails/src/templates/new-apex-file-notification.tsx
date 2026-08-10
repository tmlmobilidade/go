/* * */

import { Anchor } from '@/components/Anchor/index.js';
import { Greeting } from '@/components/Greeting/index.js';
import { Paragraph } from '@/components/Paragraph/index.js';
import { Span } from '@/components/Span/index.js';
import { Wrapper } from '@/components/Wrapper/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import { render } from 'react-email';

/* * */

export const newApexFileNotificationSubject = 'Novo ficheiro de configuração APEX';

/* * */

export interface NewApexFileNotificationTemplateProps {
	agencyName: string
	planId: string
	startDate: OperationalDate
}

/* * */

export default function NewApexFileNotificationTemplate({ agencyName, planId, startDate }: NewApexFileNotificationTemplateProps) {
	return (
		<Wrapper previewMessage="Notificação de novo ficheiro de configuração APEX.">
			<Greeting text="Olá 👋" />
			<Paragraph>
				Foi disponibilizado no GO um novo ficheiro de configuração APEX para o plano
				<Anchor href={`https://go.tmlmobilidade.pt/plans/approved/${planId}`} spaceAfter spaceBefore text={planId} />
				do operador
				<Span spaceAfter spaceBefore weight="bold">{agencyName}</Span>
				com início a
				<Span spaceBefore weight="bold">{Dates.fromOperationalDate(startDate, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR, 'pt-PT')}</Span>
				.
			</Paragraph>
			<Paragraph bold color="success">O ficheiro de configuração está em anexo neste email.</Paragraph>
			<Paragraph>Se tiveres alguma questão, entra em contacto connosco via Email ou Teams.</Paragraph>
		</Wrapper>
	);
};

/* * */

NewApexFileNotificationTemplate.PreviewProps = {
	agencyName: 'Operador 1',
	planId: 'ABC56',
	startDate: '20260101' as OperationalDate,
} satisfies NewApexFileNotificationTemplateProps;

/* * */

export const renderNewApexFileNotificationTemplate = async (props: NewApexFileNotificationTemplateProps) => {
	return await render(<NewApexFileNotificationTemplate {...props} />);
};

/* * */

export const sendNewApexFileNotificationEmail = async ({ attachments, data, to }: SendEmailProps<NewApexFileNotificationTemplateProps>) => {
	await emailProvider.send({
		attachments: attachments,
		html: await renderNewApexFileNotificationTemplate(data),
		subject: newApexFileNotificationSubject,
		to: to,
	});
};
