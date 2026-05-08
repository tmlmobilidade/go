'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { openCreateStopModal } from '@/contexts/StopDetailCoordinates.modal';
import { Translations } from '@/lib/translations';
import { LifecycleStatusSchema } from '@tmlmobilidade/types';
import { Button, Collapsible, Grid, ProposedChangesWrapper, Section, SegmentedControl, TextInput, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionGeneral() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const lifecycleStatusItems = LifecycleStatusSchema.options.map(value => ({
		label: Translations.LIFECYCLE_STATUS[value],
		value: value,
	}));

	//
	// C. Handle actions

	// const handlePlayPhoneticName = async () => {
	// 	if (typeof window !== 'undefined') {
	// 		const synth = window.speechSynthesis;
	// 		const utterance = new SpeechSynthesisUtterance(stopDetailContext.data.form.values.tts_name || '');
	// 		utterance.lang = 'pt';
	// 		synth.speak(utterance);
	// 	}
	// };

	//
	// D. Render components

	return (
		<Collapsible
			description="Informações gerais sobre esta paragem."
			title="Detalhes desta Paragem"
		>

			<Section>
				<Grid columns="abc" gap="md">
					<ValueDisplay label="Código Único da Paragem" value={stopDetailContext.data.stop?._id ?? 'N/A'} variant="bordered" />
					<ValueDisplay label="Latitude" value={stopDetailContext.data.stop?.latitude ?? 'N/A'} variant="bordered" />
					<ValueDisplay label="Longitude" value={stopDetailContext.data.stop?.longitude ?? 'N/A'} variant="bordered" />
					<Button label="Editar Coordenadas" onClick={() => openCreateStopModal()} style={{ marginTop: '10px', width: '250px' }} />
				</Grid>
			</Section>

			<Section>
				<Grid>
					<SegmentedControl
						key={stopDetailContext.data.form.key('lifecycle_status')}
						data={lifecycleStatusItems}
						readOnly={stopDetailContext.flags.isReadOnly}
						value={stopDetailContext.data.form.values.lifecycle_status}
						{...stopDetailContext.data.form.getInputProps('lifecycle_status')}
					/>
				</Grid>
			</Section>

			<Section>
				<Grid columns="a" gap="md">

					<ProposedChangesWrapper
						inputName="name"
						label="Nome Único da Paragem"
						relatedId={String(stopDetailContext.data.stop?._id)}
						scope="stop"
					>
						<TextInput
							readOnly={stopDetailContext.flags.isReadOnly}
							{...stopDetailContext.data.form.getInputProps('name')}
						/>
					</ProposedChangesWrapper>

				</Grid>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<ValueDisplay label="Nome Curto" value={stopDetailContext.data.form.getValues()?.short_name ?? 'N/A'} variant="bordered" />
					<ValueDisplay label="Nome TTS" value={stopDetailContext.data.form.getValues()?.tts_name ?? 'N/A'} variant="bordered" />
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
