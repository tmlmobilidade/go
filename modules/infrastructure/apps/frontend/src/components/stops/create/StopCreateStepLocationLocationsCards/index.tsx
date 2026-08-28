'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { StandardFormController, Grid, Section, Skeleton, useLocationsContext, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopCreateStepLocationLocationsCards() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const locationsContext = useLocationsContext();

	const [districtId, localityId, municipalityId, parishId] = stopCreateContext.form.instance.getValues(['district_id', 'locality_id', 'municipality_id', 'parish_id']);

	const [districtLabel, localityLabel, municipalityLabel, parishLabel] = useMemo(() => [
		locationsContext.actions.getDistrict(districtId)?.name ?? '-',
		locationsContext.actions.getLocality(localityId)?.name ?? '-',
		locationsContext.actions.getMunicipality(municipalityId)?.name ?? '-',
		locationsContext.actions.getParish(parishId)?.name ?? '-',
	], [districtId, localityId, municipalityId, parishId]);

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="ab" gap="md">
				<StandardFormController
					control={stopCreateContext.form.instance.control}
					name="district_id"
					render={() => <ValueDisplay label="Distrito" value={locationsContext.flags.is_loading ? <Skeleton height={12} width={230} /> : districtLabel} variant="bordered" />}
				/>
				<StandardFormController
					control={stopCreateContext.form.instance.control}
					name="municipality_id"
					render={() => <ValueDisplay label="Município" value={locationsContext.flags.is_loading ? <Skeleton height={12} width={230} /> : municipalityLabel} variant="bordered" />}
				/>
				<StandardFormController
					control={stopCreateContext.form.instance.control}
					name="parish_id"
					render={() => <ValueDisplay label="Freguesia" value={locationsContext.flags.is_loading ? <Skeleton height={12} width={230} /> : parishLabel} variant="bordered" />}
				/>
				<StandardFormController
					control={stopCreateContext.form.instance.control}
					name="locality_id"
					render={() => <ValueDisplay label="Localidade" value={locationsContext.flags.is_loading ? <Skeleton height={12} width={230} /> : localityLabel} variant="bordered" />}
				/>
			</Grid>
		</Section>
	);

	//
}
