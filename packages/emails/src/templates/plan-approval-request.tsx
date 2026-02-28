/* * */

import { DebugCode } from '@/components/DebugCode/index.js';
import { Greeting } from '@/components/Greeting/index.js';
import { MainButton } from '@/components/MainButton/index.js';
import { Paragraph } from '@/components/Paragraph/index.js';
import { Span } from '@/components/Span/index.js';
import { Wrapper } from '@/components/Wrapper/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { render } from '@react-email/components';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export const planApprovalRequestSubject = 'Pedido de aprovação de plano';

/* * */

export interface PlanApprovalRequestTemplateProps {
	agencyName: string
	endDate: OperationalDate
	firstName: string
	gtfsValidationId: string
	gtfsValidationUrl: string
	requestedBy: string
	startDate: OperationalDate
}

/* * */

export default function PlanApprovalRequestTemplate({ agencyName, endDate, firstName, gtfsValidationId, gtfsValidationUrl, requestedBy, startDate }: PlanApprovalRequestTemplateProps) {
	return (
		<Wrapper previewMessage="Pedido de aprovação de plano">
			<Greeting text={`${firstName},`} />
			<Paragraph>
				Após uma validação de GTFS com sucesso,
				<Span spaceAfter spaceBefore weight="bold">{requestedBy}</Span>
				pede a respetiva aprovação para plano.
			</Paragraph>
			<Paragraph>
				<Span spaceAfter spaceBefore weight="bold">Operador: </Span>
				{agencyName}
			</Paragraph>
			<Paragraph>
				<Span spaceAfter spaceBefore weight="bold">Início: </Span>
				{Dates.fromOperationalDate(startDate, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR, 'pt-PT')}
			</Paragraph>
			<Paragraph>
				<Span spaceAfter spaceBefore weight="bold">Fim: </Span>
				{Dates.fromOperationalDate(endDate, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR, 'pt-PT')}
			</Paragraph>
			<MainButton href={gtfsValidationUrl} label="Ver detalhes da validação" />
			<DebugCode label="GTFS Validation ID" value={gtfsValidationId} />
		</Wrapper>
	);
};

/* * */

PlanApprovalRequestTemplate.PreviewProps = {
	agencyName: 'Viação Alvorada',
	endDate: '20250131' as OperationalDate,
	firstName: 'Josué',
	gtfsValidationId: 'ABC123',
	gtfsValidationUrl: 'https://www.tmlmobilidade.pt/validations/ABC123',
	requestedBy: 'Maria Adelaide',
	startDate: '20250101' as OperationalDate,
} satisfies PlanApprovalRequestTemplateProps;

/* * */

export const renderPlanApprovalRequestTemplate = async (props: PlanApprovalRequestTemplateProps) => {
	return await render(<PlanApprovalRequestTemplate {...props} />);
};

/* * */

export const sendPlanApprovalRequestEmail = async ({ data, to }: SendEmailProps<PlanApprovalRequestTemplateProps>) => {
	await emailProvider.send({
		html: await renderPlanApprovalRequestTemplate(data),
		subject: planApprovalRequestSubject,
		to: to,
	});
};
