'use client';

import { Translations } from '@/lib/translations';
import { LifecycleStatusValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, Grid, Section, SegmentedControl, StandardFormController } from '@tmlmobilidade/ui';

import { StopsDetailUpdateCoordinates } from '../../coordinates/StopsDetailUpdateCoordinates';
import { StopsDetailUpdateName } from '../../name/StopsDetailUpdateName';
import { useStopsDetailFormContext } from '../../StopsDetailForm.context';

/* * */

export function StopsDetailSectionGeneral() {
	//

	//
	// A. Setup variables

	const { capabilities, form } = useStopsDetailFormContext();

	//
	// B. Transform data

	const lifecycleStatusItems = LifecycleStatusValues.map(value => ({
		label: Translations.LIFECYCLE_STATUS[value],
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações gerais sobre esta paragem."
			title="Detalhes desta Paragem"
		>

			<Section>
				<Grid columns="ab" gap="md" placeItems="start">
					<StopsDetailUpdateCoordinates />
					<StopsDetailUpdateName />
				</Grid>
			</Section>

			<Section>
				<Grid>
					<StandardFormController
						control={form.control}
						name="lifecycle_status"
						render={({ field }) => (
							<SegmentedControl
								data={lifecycleStatusItems}
								disabled={field.disabled}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
				</Grid>
			</Section>

			{/* <Section>
				<Grid columns="a" gap="md">
					<ValueDisplay
						icon={canEditStopName ? <IconEdit size={16} /> : undefined}
						label="Nome Único da Paragem"
						onClick={canEditStopName ? stopDetailContext.actions.openNamesEditor : undefined}
						value={stopDetailContext.data.form.getValues()?.name ?? 'N/A'}
						variant="bordered"
					/>

				</Grid>
			</Section> */}

			{/* <Section>
				<Grid columns="ab" gap="md">
					<ValueDisplay
						icon={canEditStopName ? <IconEdit size={16} /> : undefined}
						label="Nome Curto"
						value={stopDetailContext.data.form.getValues()?.short_name ?? 'N/A'}
						variant="bordered"
					/>
					<ValueDisplay
						icon={canEditStopName ? <IconEdit size={16} /> : undefined}
						label="Nome TTS"
						onClick={canEditStopName ? stopDetailContext.actions.openNamesEditor : undefined}
						value={stopDetailContext.data.form.values.tts_name ?? 'N/A'}
						variant="bordered"
					/>
				</Grid>

			</Section> */}

			<Section>
				<Grid columns="a">
					{/* <StopDetailTts /> */}
				</Grid>
			</Section>

			{/* {stopDetailContext.flags.isCoordinatesEditorOpen && <StopDetailCoordinatesModal />}
			{stopDetailContext.flags.isNamesEditorOpen &&	<StopDetailNamesModal /> } */}

		</Collapsible>
	);

	//
}
