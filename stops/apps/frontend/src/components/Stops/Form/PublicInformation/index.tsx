'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { hasAnySchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function PublicInformation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const has_this = hasAnySchema.options.map (value => ({
		label: Translations.HAS_ANY[value],
		value: value,
	}));

	//
	// B. Render components

	return (
		<Collapsible
			description="Informação relacionadas com os suportes de informação ao público."
			title="Informação ao público"
		>
			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={has_this}
						label="Tem Postalete?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_stop_sign')}
					/>
					<TextInput
						label="Entidade Gestora do Postalete"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('stop_sign_maintainer')}
					/>

				</Grid>
				<Spacer />
			</Section>

			<Section>
				<TextInput
					label="Tem Moldura?"
					miw="100%"
					placeholder="..."
					{...stopDetailContext.data.form.getInputProps('has_pole_frame')}
				/>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={has_this}
						label="Tem PIP Áudio?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_pip_audio')}
					/>
					<TextInput
						disabled={!has_this}
						label="Código do PIP Áudio"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('pip_audio_code')} // this variable is not existing in the original code
					/>
					<Combobox
						data={has_this}
						label="Tem PIP Realtime?"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('has_pip_real_time')}
					/>
					<TextInput
						disabled={!has_this}
						label="Código do PIP Realtime"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('pip_real_time_code')}
					/>
				</Grid>
			</Section>

			<Section>
				<Combobox
					data={has_this}
					label="Tem Sinalização H2OA?"
					placeholder="Escolha uma opção"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('has_h2oa_signage')}
				/>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={has_this}
						label="Tem Horários?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_schedules')}
					/>
					<Combobox
						data={has_this}
						label="Tem Horários Táteis?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_tactile_schedules')}
					/>
				</Grid>
			</Section>

			<Section>
				<Combobox
					data={has_this}
					label="Tem Mapa de Rede?"
					placeholder="Escolha uma opção"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('has_network_map')}
				/>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						label="Última Manutenção dos Horários?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_schedules_maintenance')}
					/>
					<TextInput
						label="Última Verificação dos Horários?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_schedules_check')}
					/>
					<TextInput
						label="Última Manutenção do Postalete?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_stop_sign_maintenance')}
					/>
					<TextInput
						label="Última Manutenção do Postalete?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_stop_sign_check')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
