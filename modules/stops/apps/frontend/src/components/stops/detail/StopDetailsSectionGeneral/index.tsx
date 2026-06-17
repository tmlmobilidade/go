'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { StopDetailCoordinatesModal } from '@/components/stops/detail/StopDetailCoordinates/StopDetailCoordinatesModal';
import { StopDetailNamesModal } from '@/components/stops/detail/StopDetailCoordinates/StopDetailNamesModal';
import { Translations } from '@/lib/translations';
import { IconEdit } from '@tabler/icons-react';
import { LifecycleStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, SegmentedControl, useMeContext, ValueDisplay } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function StopDetailsSectionGeneral() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const meContext = useMeContext();

	const canEditStopCoordinates = meContext.actions.hasPermission('stops', 'edit_coordinates') && !stopDetailContext.flags.isReadOnly;
	const canEditStopName = meContext.actions.hasPermission('stops', 'edit_name') && !stopDetailContext.flags.isReadOnly;

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
					<ValueDisplay
						className={canEditStopCoordinates ? styles['coords-label'] : undefined}
						icon={canEditStopCoordinates ? <IconEdit size={16} /> : undefined}
						label="Latitude"
						onClick={canEditStopCoordinates ? stopDetailContext.actions.openCoordinatesEditor : undefined}
						value={stopDetailContext.data.form.values.latitude ?? 'N/A'}
						variant="bordered"
					/>
					<ValueDisplay
						className={canEditStopCoordinates ? styles['coords-label'] : undefined}
						icon={canEditStopCoordinates ? <IconEdit size={16} /> : undefined}
						label="Longitude"
						onClick={canEditStopCoordinates ? stopDetailContext.actions.openCoordinatesEditor : undefined}
						value={stopDetailContext.data.form.values.longitude ?? 'N/A'}
						variant="bordered"
					/>
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
					<ValueDisplay
						// icon={canEditStopName ? <IconEdit size={16} /> : undefined}
						label="Nome Único da Paragem"
						onClick={canEditStopName ? stopDetailContext.actions.openNamesEditor : undefined}
						value={stopDetailContext.data.form.getValues()?.name ?? 'N/A'}
						variant="bordered"
					/>

				</Grid>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<ValueDisplay
						// icon={canEditStopName ? <IconEdit size={16} /> : undefined}
						label="Nome Curto"
						value={stopDetailContext.data.form.getValues()?.short_name ?? 'N/A'}
						variant="bordered"
					/>
					<ValueDisplay
						// icon={canEditStopName ? <IconEdit size={16} /> : undefined}
						label="Nome TTS"
						onClick={canEditStopName ? stopDetailContext.actions.openNamesEditor : undefined}
						value={stopDetailContext.data.form.values.tts_name ?? 'N/A'}
						variant="bordered"
					/>
				</Grid>
			</Section>

			{stopDetailContext.flags.isCoordinatesEditorOpen && <StopDetailCoordinatesModal />}
			{stopDetailContext.flags.isNamesEditorOpen &&	<StopDetailNamesModal /> }

		</Collapsible>
	);

	//
}
