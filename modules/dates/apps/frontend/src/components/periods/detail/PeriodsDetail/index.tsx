'use client';

/* * */

import { usePeriodsDetailContext } from '@/components/periods/detail/PeriodsDetail.context';
import { PeriodsDetailHeader } from '@/components/periods/detail/PeriodsDetailHeader';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PeriodSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { Button, ColorInput, ErrorDisplay, LoadingOverlay, Pane, Section, Select, TextInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function PeriodsDetail() {
	//

	//
	// A. Setup variables

	const periodsDetailContext = usePeriodsDetailContext();
	const router = useRouter();
	const { options: allAgencyOptions } = useDataAgencies(PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.create);

	//
	// B. Handle actions

	const openCalendar = () => {
		router.push(PAGE_ROUTES.dates.PERIODS_LIST);
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
					required={!PeriodSchema.shape.name.isOptional()}
					w="100%"
					{...periodsDetailContext.data.form.getInputProps('name')}
				/>

				<Select
					key={periodsDetailContext.data.form.key('agency_id')}
					data={allAgencyOptions}
					disabled={periodsDetailContext.flags.isReadOnly}
					label="Operador"
					w="100%"
					{...periodsDetailContext.data.form.getInputProps('agency_id')}
				/>

				<ColorInput
					key={periodsDetailContext.data.form.key('color')}
					label="Cor"
					readOnly={periodsDetailContext.flags.isReadOnly}
					required={!PeriodSchema.shape.color.isOptional()}
					withEyeDropper={false}
					{...periodsDetailContext.data.form.getInputProps('color')}
				/>

				<Button label="Atribuir Datas" onClick={openCalendar} />

			</Section>
		</Pane>
	);

	//
}
