/* * */

import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { LineSchema } from '@tmlmobilidade/types';
import { Collapsible, Section, Switch } from '@tmlmobilidade/ui';

/* * */

export function LineDetailSectionSpecs() {
	//

	//
	// A. Setup variables

	const lineDetailContext = useLineDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title="Especificações da Linha">
			<Section gap="sm">
				<Switch
					key={lineDetailContext.data.form.key('is_circular_line')}
					disabled={lineDetailContext.flags.isReadOnly}
					label="Linha Circular"
					required={!LineSchema.shape.is_circular_line.isOptional()}
					{...lineDetailContext.data.form.getInputProps('is_circular_line', { type: 'checkbox' })}
				/>

				<Switch
					key={lineDetailContext.data.form.key('is_school_line')}
					disabled={lineDetailContext.flags.isReadOnly}
					label="Linha Escolar"
					required={!LineSchema.shape.is_school_line.isOptional()}
					{...lineDetailContext.data.form.getInputProps('is_school_line', { type: 'checkbox' })}
				/>

				<Switch
					key={lineDetailContext.data.form.key('is_continuous_line')}
					disabled={lineDetailContext.flags.isReadOnly}
					label="Permitir entradas e saídas em qualquer lugar (linha azul)"
					required={!LineSchema.shape.is_continuous_line.isOptional()}
					{...lineDetailContext.data.form.getInputProps('is_continuous_line', { type: 'checkbox' })}
				/>
			</Section>
		</Collapsible>
	);

	//
}
