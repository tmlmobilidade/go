/* * */

import { Anchor } from '@/components/Anchor/index.js';
import { Greeting } from '@/components/Greeting/index.js';
import { MainButton } from '@/components/MainButton/index.js';
import { Paragraph } from '@/components/Paragraph/index.js';
import { Span } from '@/components/Span/index.js';
import { Wrapper } from '@/components/Wrapper/index.js';
import { emailProvider } from '@/email.provider.js';
import { type SendEmailProps } from '@/types.js';
import { render } from '@react-email/components';
import { getAppConfig } from '@tmlmobilidade/consts';

/* * */

export const unsuccessfulGtfsValidationSubject = 'Validação GTFS com erros';

/* * */

export interface UnsuccessfulGtfsValidationTemplateProps {
	firstName: string
	totalErrors?: number
	totalWarnings?: number
	validationId: string
}

/* * */

export default function UnsuccessfulGtfsValidationTemplate({ firstName, totalErrors = 0, totalWarnings = 0, validationId }: UnsuccessfulGtfsValidationTemplateProps) {
	//

	const go_link = getAppConfig('plans', 'frontend_url') + '/validations/' + validationId;

	return (
		<Wrapper previewMessage="O GTFS que submeteste contém erros.">
			<Greeting text={`${firstName},`} />
			<Paragraph>
				Foram encontrados
				<Span color="danger" spaceAfter spaceBefore weight="bold">
					{totalErrors}
					{' '}
					erros
				</Span>
				e
				<Span color="warning" spaceAfter spaceBefore weight="bold">
					{totalWarnings}
					{' '}
					avisos
				</Span>
				no GTFS que submeteste para validação.
			</Paragraph>
			<Paragraph>
				No resumo da validação encontras mais detalhe sobre cada um. Se tiveres dúvidas sobre alguma regra
				<Anchor href="https://go.tmlmobilidade.com/docs" spaceAfter spaceBefore text="explora a documentação" />
				ou entra em contacto connosco.
			</Paragraph>
			<Paragraph bold size="md">Erros formais impedem a publicação do GTFS e devem ser corrigidos para prosseguir com a aprovação.</Paragraph>
			<MainButton href={go_link} label="Ver resumo da validação" />
		</Wrapper>
	);
};

/* * */

UnsuccessfulGtfsValidationTemplate.PreviewProps = {
	firstName: 'Josué',
	totalErrors: 4,
	totalWarnings: 3,
	validationId: 'TUH16N',
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
