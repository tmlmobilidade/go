'use client';

import { usePeriodsDetailContext } from '@/components/year-periods/detail/PeriodsDetail.context';
import { PeriodsDetailHeader } from '@/components/year-periods/detail/PeriodsDetailHeader';
import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, YearPeriodSchema } from '@tmlmobilidade/types';
import { Button, ColorInput, ErrorDisplay, LoadingOverlay, MultiSelect, Pane, Section, TextInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function PeriodsDetail() {
	//

	//
	// A. Setup variables

	const periodsDetailContext = usePeriodsDetailContext();
	const router = useRouter();

	const { options: allAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.year_periods.actions.create],
		scope: PermissionCatalog.all.year_periods.scope,
	});

	//
	// B. Handle actions

	const openCalendar = () => {
		router.push(PAGE_ROUTES.dates.YEAR_PERIODS_LIST);
	};

	//
	// C. Render components

	if (periodsDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (periodsDetailContext.flags.error) {
		return <ErrorDisplay message={periodsDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<PeriodsDetailHeader />]}>
			<Section gap="lg">

				<TextInput
					label="Nome"
					placeholder="Ex: Período Escolar 2024/2025"
					readOnly={periodsDetailContext.flags.isReadOnly}
					required={!YearPeriodSchema.shape.name.isOptional()}
					w="100%"
					{...periodsDetailContext.data.form.getInputProps('name')}
				/>

				<TextInput
					label="Código"
					placeholder="Ex: 1"
					readOnly={periodsDetailContext.flags.isReadOnly}
					required={!YearPeriodSchema.shape.code.isOptional()}
					w="100%"
					{...periodsDetailContext.data.form.getInputProps('code')}
				/>

				<MultiSelect
					key={periodsDetailContext.data.form.key('agency_ids')}
					data={allAgencyOptions}
					disabled={periodsDetailContext.flags.isReadOnly}
					label="Operadores"
					w="100%"
					{...periodsDetailContext.data.form.getInputProps('agency_ids')}
				/>

				<ColorInput
					key={periodsDetailContext.data.form.key('color')}
					label="Cor"
					readOnly={periodsDetailContext.flags.isReadOnly}
					required={!YearPeriodSchema.shape.color.isOptional()}
					withEyeDropper={false}
					{...periodsDetailContext.data.form.getInputProps('color')}
				/>

				<Button label="Atribuir Datas" onClick={openCalendar} />

			</Section>
		</Pane>
	);

	//
}
