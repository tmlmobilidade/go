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

export const planApprovedSubject = 'Plano Aprovado';

/* * */

export interface PlanApprovedTemplateProps {
	createdBy: string
	endDate: OperationalDate
	firstName: string
	planId: string
	planUrl: string
	startDate: OperationalDate
}

/* * */

export default function PlanApprovedTemplate({ createdBy, endDate, firstName, planId, planUrl, startDate }: PlanApprovedTemplateProps) {
	return (
		<Wrapper previewMessage="Plano aprovado com sucesso">
			<Greeting text={`${firstName},`} />
			<Paragraph>
				O plano
				<Span spaceAfter spaceBefore weight="bold">{planId}</Span>
				foi aprovado  por
				<Span spaceAfter spaceBefore weight="bold">{createdBy}</Span>
				e está agora em processamento.
			</Paragraph>
			<Paragraph>
				<Span spaceAfter spaceBefore weight="bold">Início: </Span>
				{Dates.fromOperationalDate(startDate, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR, 'pt-PT')}
			</Paragraph>
			<Paragraph>
				<Span spaceAfter spaceBefore weight="bold">Fim: </Span>
				{Dates.fromOperationalDate(endDate, 'Europe/Lisbon').toLocaleString(Dates.FORMATS.DATE_FULL_WITH_YEAR, 'pt-PT')}
			</Paragraph>
			<MainButton href={planUrl} label="Ver detalhes do plano" />
			<DebugCode label="Plan ID" value={planId} />
		</Wrapper>
	);
};

/* * */

PlanApprovedTemplate.PreviewProps = {
	createdBy: 'Maria Adelaide',
	endDate: '20260131' as OperationalDate,
	firstName: 'Josué',
	planId: 'YUA81A',
	planUrl: 'https://go.tmlmobilidade.pt/plans/YUA81A',
	startDate: '20250101' as OperationalDate,
} satisfies PlanApprovedTemplateProps;

/* * */

export const renderPlanApprovedTemplate = async (props: PlanApprovedTemplateProps) => {
	return await render(<PlanApprovedTemplate {...props} />);
};

/* * */

export const sendPlanApprovedEmail = async ({ data, to }: SendEmailProps<PlanApprovedTemplateProps>) => {
	await emailProvider.send({
		html: await renderPlanApprovedTemplate(data),
		subject: planApprovedSubject,
		to: to,
	});
};
