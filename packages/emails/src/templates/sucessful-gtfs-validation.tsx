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

export const sucessfulGtfsValidationSubject = 'Validação GTFS realizada com sucesso';

/* * */

export interface SucessfulGtfsValidationTemplateProps {
	firstName: string
	totalWarnings?: number
	validationId: string
}

/* * */

export default function SucessfulGtfsValidationTemplate({ firstName, totalWarnings = 0, validationId }: SucessfulGtfsValidationTemplateProps) {
	//

	const go_link = getAppConfig('plans', 'frontend_url') + '/validations/' + validationId;

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
				<Anchor href="https://go.tmlmobilidade.com/docs" spaceAfter spaceBefore text="explora a documentação" />
				ou entra em contacto connosco.
			</Paragraph>
			<Paragraph>A validação pode agora ser aprovada para plano.</Paragraph>
			<MainButton href={go_link} label="Ver resumo da validação" />
		</Wrapper>
	);
};

/* * */

SucessfulGtfsValidationTemplate.PreviewProps = {
	firstName: 'Josué',
	totalWarnings: 0,
	validationId: 'TUH16N',
} satisfies SucessfulGtfsValidationTemplateProps;

/* * */

export const renderSucessfulGtfsValidationTemplate = async (props: SucessfulGtfsValidationTemplateProps) => {
	return await render(<SucessfulGtfsValidationTemplate {...props} />);
};

/* * */

export const sendSucessfulGtfsValidationEmail = async ({ data, to }: SendEmailProps<SucessfulGtfsValidationTemplateProps>) => {
	await emailProvider.send({
		html: await renderSucessfulGtfsValidationTemplate(data),
		subject: sucessfulGtfsValidationSubject,
		to: to,
	});
};
