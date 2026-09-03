/* * */

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useTypologyDetailContext } from '@/components/typologies/detail/TypologyDetail.context';
import { TypologySchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, MultiSelect, Section, TextInput } from '@tmlmobilidade/ui';
/* * */

export function TypologyDetailSectionConfig() {
	//

	//
	// A. Setup variables

	const typologyDetailContext = useTypologyDetailContext();

	const { options: agencyOptions } = useAgenciesData();

	//
	// B. Render components

	return (
		<Collapsible title="Configuração Básica" defaultOpen>
			<Section gap="sm">
				<TextInput
					key={typologyDetailContext.data.form.key('name')}
					disabled={typologyDetailContext.flags.isReadOnly}
					label="Nome"
					placeholder="Ex: Autocarro"
					required={!TypologySchema.shape.name.isOptional()}
					w="100%"
					{...typologyDetailContext.data.form.getInputProps('name')}
				/>

				<TextInput
					key={typologyDetailContext.data.form.key('code')}
					disabled={typologyDetailContext.flags.isReadOnly}
					label="Código"
					placeholder="Ex: BUS"
					required={!TypologySchema.shape.code.isOptional()}
					w="100%"
					{...typologyDetailContext.data.form.getInputProps('code')}
				/>

				<MultiSelect
					key={typologyDetailContext.data.form.key('agency_ids')}
					data={agencyOptions}
					disabled={typologyDetailContext.flags.isReadOnly}
					label="Operadores"
					{...typologyDetailContext.data.form.getInputProps('agency_ids')}
				/>
			</Section>
		</Collapsible>
	);
}
