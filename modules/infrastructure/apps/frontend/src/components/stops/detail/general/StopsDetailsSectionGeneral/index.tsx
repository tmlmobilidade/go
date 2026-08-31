'use client';

// import { StopDetailTts } from '@/components/stops/detail/general/StopDetailTts';
import { Translations } from '@/lib/translations';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { LifecycleStatusValues } from '@tmlmobilidade/go-types-shared';
import { Collapsible, Grid, Inline, Section, SegmentedControl, StandardFormController, useMeData, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useStopsDetailFormContext } from '../../StopsDetailForm.context';
import { useStopsDetailData } from '../../use-stops-detail-data';

/* * */

export function StopsDetailsSectionGeneral() {
	//

	//
	// A. Setup variables

	const { data } = useStopsDetailData();

	const { data: meData } = useMeData();

	const { capabilities, form } = useStopsDetailFormContext();

	//
	// B. Transform data

	const lifecycleStatusItems = LifecycleStatusValues.map(value => ({
		label: Translations.LIFECYCLE_STATUS[value],
		value: value,
	}));

	const canEditCoordinates = useMemo(() => {
		return hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'edit_coordinates', scope: 'stops' },
			requiredValue: data?.municipality_id,
			resourceKey: 'municipality_ids',
		});
	}, [data?.municipality_id, meData?.permissions]);

	const canEditName = useMemo(() => {
		return hasPermissionResource(meData?.permissions, {
			requiredPermission: { action: 'edit_name', scope: 'stops' },
			requiredValue: data?.municipality_id,
			resourceKey: 'municipality_ids',
		});
	}, [data?.municipality_id, meData?.permissions]);

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações gerais sobre esta paragem."
			title="Detalhes desta Paragem"
			defaultOpen
		>

			<Section>
				<Grid columns="ab" gap="md" placeItems="start">
					<ValueDisplay
						footer={canEditCoordinates && <Inline onClick={() => {}} dotted>Editar</Inline>}
						label="Coordenadas"
						value={`${data?.latitude ?? 'N/A'}, ${data?.longitude ?? 'N/A'}`}
						variant="bordered"
					/>
					<ValueDisplay
						footer={canEditName && <Inline onClick={() => {}} dotted>Editar</Inline>}
						label="Nome Único da Paragem"
						value={data?.name ?? 'N/A'}
						variant="bordered"
					/>
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
