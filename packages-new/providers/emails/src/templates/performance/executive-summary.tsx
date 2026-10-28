/* * */

import { render } from 'react-email';

import { Anchor } from '../../components/Anchor/index.js';
import { DebugCode } from '../../components/DebugCode/index.js';
import { Greeting } from '../../components/Greeting/index.js';
import { MainButton } from '../../components/MainButton/index.js';
import { Paragraph } from '../../components/Paragraph/index.js';
import { Span } from '../../components/Span/index.js';
import { Wrapper } from '../../components/Wrapper/index.js';
import { emailProvider } from '../../email.provider.js';
import { type SendEmailProps } from '../../types.js';

/* * */

export const executiveSummarySubject = 'Validação GTFS realizada com sucesso';

/* * */

export interface ExecutiveSummaryTemplateProps {
	firstName: string
	gtfsValidationId: string
	gtfsValidationUrl: string
	totalWarnings?: number
}

/* * */

export default function ExecutiveSummaryTemplate({ firstName, gtfsValidationId, gtfsValidationUrl, totalWarnings = 0 }: ExecutiveSummaryTemplateProps) {
	return (
		<Wrapper previewMessage="Validação GTFS realizada com sucesso">
			<Greeting text={`${firstName},`} />
			<Paragraph bold color="success">Não foram encontrados erros no GTFS que enviaste para validação.</Paragraph>
			{totalWarnings === 1 && (
				<Paragraph>
					No entanto, foi encontrado
					<Span color="warning" spaceAfter spaceBefore weight="bold">
						{totalWarnings}
						{' '}
						aviso
					</Span>
					que deve ser corrigido o mais breve possível, pois pode passar a ser considerado erro formal no futuro.
				</Paragraph>
			)}
			{totalWarnings > 1 && (
				<Paragraph>
					No entanto, foram encontrados
					<Span color="warning" spaceAfter spaceBefore weight="bold">
						{totalWarnings}
						{' '}
						avisos
					</Span>
					que devem ser corrigidos o mais breve possível, pois podem passar a ser considerados erros formais no futuro.
				</Paragraph>
			)}
			<Paragraph>
				Se tiveres dúvidas sobre alguma regra
				<Anchor href="https://go.tmlmobilidade.pt/reference" spaceAfter spaceBefore text="explora a documentação" />
				ou entra em contacto connosco.
			</Paragraph>
			<Paragraph>A validação pode agora ser aprovada para plano.</Paragraph>
			<MainButton href={gtfsValidationUrl} label="Ver resumo da validação" />
			<DebugCode label="GTFS Validation ID" value={gtfsValidationId} />
		</Wrapper>
	);
};

/* * */

ExecutiveSummaryTemplate.PreviewProps = {
	firstName: 'Josué',
	gtfsValidationId: 'TUH16N',
	gtfsValidationUrl: 'https://go.tmlmobilidade.pt/gtfs-validations/TUH16N',
	totalWarnings: 0,
} satisfies ExecutiveSummaryTemplateProps;

/* * */

export const renderExecutiveSummaryTemplate = async (props: ExecutiveSummaryTemplateProps) => {
	return await render(<ExecutiveSummaryTemplate {...props} />);
};

/* * */

export const sendExecutiveSummaryEmail = async ({ data, to }: SendEmailProps<ExecutiveSummaryTemplateProps>) => {
	await emailProvider.send({
		html: await renderExecutiveSummaryTemplate(data),
		subject: executiveSummarySubject,
		to: to,
	});
};
