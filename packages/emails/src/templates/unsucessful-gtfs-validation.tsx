/* * */

import { Anchor } from '@/components/Anchor/index.js';
import { DebugCode } from '@/components/DebugCode/index.js';
import { Greeting } from '@/components/Greeting/index.js';
import { MainButton } from '@/components/MainButton/index.js';
import { Paragraph } from '@/components/Paragraph/index.js';
import { Span } from '@/components/Span/index.js';
import { Wrapper } from '@/components/Wrapper/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { render } from 'react-email';

/* * */

export const unsuccessfulGtfsValidationSubject = 'Validação GTFS com erros';

/* * */

export interface UnsuccessfulGtfsValidationTemplateProps {
	firstName: string
	gtfsValidationId: string
	gtfsValidationUrl: string
	totalErrors: number
	totalWarnings: number
}

/* * */

export default function UnsuccessfulGtfsValidationTemplate({ firstName, gtfsValidationId, gtfsValidationUrl, totalErrors = 0, totalWarnings = 0 }: UnsuccessfulGtfsValidationTemplateProps) {
	return (
		<Wrapper previewMessage="O GTFS que enviaste contém erros.">
			<Greeting text={`${firstName},`} />
			{totalErrors === 1 && (
				<Paragraph>
					Foi encontrado
					<Span color="danger" spaceAfter spaceBefore weight="bold">
						{totalErrors}
						{' '}
						erro
					</Span>
					no GTFS que enviaste para validação.
				</Paragraph>
			)}
			{totalErrors > 1 && (
				<Paragraph>
					Foram encontrados
					<Span color="danger" spaceAfter spaceBefore weight="bold">
						{totalErrors}
						{' '}
						erros
					</Span>
					no GTFS que enviaste para validação.
				</Paragraph>
			)}
			{totalWarnings === 1 && (
				<Paragraph>
					Também foi encontrado
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
					Também foram encontrados
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
			<Paragraph bold size="md">Erros formais impedem a publicação do GTFS e devem ser corrigidos para prosseguir com a aprovação.</Paragraph>
			<MainButton href={gtfsValidationUrl} label="Ver resumo da validação" />
			<DebugCode label="GTFS Validation ID" value={gtfsValidationId} />
		</Wrapper>
	);
};

/* * */

UnsuccessfulGtfsValidationTemplate.PreviewProps = {
	firstName: 'Josué',
	gtfsValidationId: 'TUH16N',
	gtfsValidationUrl: 'https://go.tmlmobilidade.pt/gtfs-validations/TUH16N',
	totalErrors: 2,
	totalWarnings: 2,
} satisfies UnsuccessfulGtfsValidationTemplateProps;

/* * */

export const renderUnsuccessfulGtfsValidationTemplate = async (props: UnsuccessfulGtfsValidationTemplateProps) => {
	return await render(<UnsuccessfulGtfsValidationTemplate {...props} />);
};

/* * */

export const sendUnsuccessfulGtfsValidationEmail = async ({ data, to }: SendEmailProps<UnsuccessfulGtfsValidationTemplateProps>) => {
	await emailProvider.send({
		html: await renderUnsuccessfulGtfsValidationTemplate(data),
		subject: unsuccessfulGtfsValidationSubject,
		to: to,
	});
};
