'use client';

/* * */

import { AgencySelect } from '@/components/common/AgencySelect';
import { PeriodsDetailHeader } from '@/components/periods/detail/PeriodsDetailHeader';
import { usePeriodsDetailContext } from '@/contexts/PeriodsDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PeriodSchema } from '@tmlmobilidade/types';
import { Button, ColorInput, ErrorDisplay, LoadingOverlay, Pane, Section, TextInput } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function PeriodsDetail() {
	//

	//
	// A. Setup variables

	const periodsDetailContext = usePeriodsDetailContext();
	const router = useRouter();

	//
	// B. Handle actions

	const openCalendar = () => {
		router.push(PAGE_ROUTES.dates.PERIODS_LIST);
	};

	//
	// C. Render components

	if (periodsDetailContext.flags.loading) {
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
					readOnly={periodsDetailContext.flags.read_only}
					required={!PeriodSchema.shape.name.isOptional()}
					w="100%"
					{...periodsDetailContext.data.form.getInputProps('name')}
				/>

				<AgencySelect
					label="Operador"
					readOnly={periodsDetailContext.flags.read_only}
					{...periodsDetailContext.data.form.getInputProps('agency_id')}
				/>

				<ColorInput
					label="Cor"
					readOnly={periodsDetailContext.flags.read_only}
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
