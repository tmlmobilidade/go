/* * */

import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { render } from 'react-email';

import { DebugCode } from '../components/DebugCode/index.js';
import { Greeting } from '../components/Greeting/index.js';
import { MainButton } from '../components/MainButton/index.js';
import { Paragraph } from '../components/Paragraph/index.js';
import { Span } from '../components/Span/index.js';
import { Wrapper } from '../components/Wrapper/index.js';
import { emailProvider } from '../email.provider.js';
import { type SendEmailProps } from '../types.js';

/* * */

export const planApprovalRequestSubject = 'Pedido de aprovação de plano';

/* * */

export interface PlanApprovalRequestTemplateProps {
	agencyName: string
	endDate: OperationalDateInt
	firstName: string
	gtfsValidationId: string
	gtfsValidationUrl: string
	requestedBy: string
	startDate: OperationalDateInt
}

/* * */

export default function PlanApprovalRequestTemplate({ agencyName, endDate, firstName, gtfsValidationId, gtfsValidationUrl, requestedBy, startDate }: PlanApprovalRequestTemplateProps) {
	return (
		<Wrapper previewMessage="Pedido de aprovação de plano">
			<Greeting text={`${firstName},`} />
			<Paragraph>
				Após uma validação de GTFS com sucesso,
				<Span weight="bold" spaceAfter spaceBefore>{requestedBy}</Span>
				pede a respetiva aprovação para plano.
			</Paragraph>
			<Paragraph>
				<Span weight="bold" spaceAfter spaceBefore>Operador: </Span>
				{agencyName}
			</Paragraph>
			<Paragraph>
				<Span spaceAfter spaceBefore weight="bold">Início: </Span>
				{Dates.fromOperationalDateInt(startDate, 'Europe/Lisbon').toLocaleString('short')}
			</Paragraph>
			<Paragraph>
				<Span spaceAfter spaceBefore weight="bold">Fim: </Span>
				{Dates.fromOperationalDateInt(endDate, 'Europe/Lisbon').toLocaleString('short')}
			</Paragraph>
			<MainButton href={gtfsValidationUrl} label="Ver detalhes da validação" />
			<DebugCode label="GTFS Validation ID" value={gtfsValidationId} />
		</Wrapper>
	);
};

/* * */

PlanApprovalRequestTemplate.PreviewProps = {
	agencyName: 'Viação Alvorada',
	endDate: 20250131 as OperationalDateInt,
	firstName: 'Josué',
	gtfsValidationId: 'ABC123',
	gtfsValidationUrl: 'https://www.tmlmobilidade.pt/validations/ABC123',
	requestedBy: 'Maria Adelaide',
	startDate: 20250101 as OperationalDateInt,
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
