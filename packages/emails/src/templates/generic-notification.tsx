/* * */

import { DebugCode } from '@/components/DebugCode/index.js';
import { MainButton } from '@/components/MainButton/index.js';
import { Paragraph } from '@/components/Paragraph/index.js';
import { Wrapper } from '@/components/Wrapper/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { render } from '@react-email/components';

/* * */

export const genericNotificationSubject = 'Nova Notificação';

/* * */

export interface GenericNotificationTemplateProps {
	body: string
	notificationId: string
	notificationUrl: string
	title: string
}

/* * */

export default function GenericNotificationTemplate({ body, notificationId, notificationUrl, title }: GenericNotificationTemplateProps) {
	return (
		<Wrapper previewMessage="Nova notificação">
			<Paragraph bold>{title}</Paragraph>
			<Paragraph>{body}</Paragraph>
			<MainButton href={notificationUrl} label="Ver Notificação" />
			<DebugCode label="Notification ID" value={notificationId} />
		</Wrapper>
	);

	//
};

/* * */

GenericNotificationTemplate.PreviewProps = {
	body: 'Foi publicado um novo alerta para a linha 1234.',
	notificationId: 'I81NT1',
	notificationUrl: 'https://www.tmlmobilidade.pt',
	title: 'Alerta de Trânsito',
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
