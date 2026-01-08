/* * */

import { useTypologyDetailContext } from '@/components/typologies/detail/TypologyDetail.context';
import { TypologySchema } from '@tmlmobilidade/types';
import { Collapsible, ColorInput, Grid, LineDisplay, Section, Spacer } from '@tmlmobilidade/ui';

/* * */

export function TypologyDetailSectionStyles() {
	//

	//
	// A. Setup variables

	const typologyDetailContext = useTypologyDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title="Estilos">
			<Section gap="sm">
				<LineDisplay color={typologyDetailContext.data.form.values.color} longName="A Carris Metropolitana é a maior" shortName="1234" textColor={typologyDetailContext.data.form.values.text_color} />

				<Spacer />

				<Grid columns="ab" gap="lg">
					<ColorInput
						key={typologyDetailContext.data.form.key('color')}
						disabled={typologyDetailContext.flags.isReadOnly}
						label="Cor do Fundo"
						required={!TypologySchema.shape.color.isOptional()}
						w="100%"
						{...typologyDetailContext.data.form.getInputProps('color')}
					/>

					<ColorInput
						key={typologyDetailContext.data.form.key('text_color')}
						disabled={typologyDetailContext.flags.isReadOnly}
						label="Cor do Texto"
						required={!TypologySchema.shape.text_color.isOptional()}
						w="100%"
						{...typologyDetailContext.data.form.getInputProps('text_color')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
