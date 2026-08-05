'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { ContextFormController, Grid, Section, Skeleton, useLocationsContext, ValueDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function StopCreateStepLocationLocationsCards() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const locationsContext = useLocationsContext();

	const [district_id, locality_id, municipality_id, parish_id] = stopCreateContext.form.instance.getValues(['district_id', 'locality_id', 'municipality_id', 'parish_id']);

	const [districtLabel, localityLabel, municipalityLabel, parishLabel] = useMemo(() => [
		locationsContext.actions.getDistrict(district_id)?.name ?? '-',
		locationsContext.actions.getLocality(locality_id)?.name ?? '-',
		locationsContext.actions.getMunicipality(municipality_id)?.name ?? '-',
		locationsContext.actions.getParish(parish_id)?.name ?? '-',
	], [district_id, locality_id, municipality_id, parish_id]);

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="ab" gap="md">
				<ContextFormController
					control={stopCreateContext.form.instance.control}
					name="district_id"
					render={() => <ValueDisplay label="Distrito" value={locationsContext.flags.is_loading ? <Skeleton height={12} width={230} /> : districtLabel} variant="bordered" />}
				/>
				<ContextFormController
					control={stopCreateContext.form.instance.control}
					name="municipality_id"
					render={() => <ValueDisplay label="Município" value={locationsContext.flags.is_loading ? <Skeleton height={12} width={230} /> : municipalityLabel} variant="bordered" />}
				/>
				<ContextFormController
					control={stopCreateContext.form.instance.control}
					name="parish_id"
					render={() => <ValueDisplay label="Freguesia" value={locationsContext.flags.is_loading ? <Skeleton height={12} width={230} /> : parishLabel} variant="bordered" />}
				/>
				<ContextFormController
					control={stopCreateContext.form.instance.control}
					name="locality_id"
					render={() => <ValueDisplay label="Localidade" value={locationsContext.flags.is_loading ? <Skeleton height={12} width={230} /> : localityLabel} variant="bordered" />}
				/>
			</Grid>
		</Section>
	);

	//
}
