'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { Button, ColorInput, Grid, keepUrlParams, MultiSelect, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

import { useYearPeriodsDetailFormContext } from '../YearPeriodsDetailForm.context';

/* * */

export function YearPeriodsDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { capabilities, form } = useYearPeriodsDetailFormContext();

	const { options: agencyOptions } = useAnnotationsAgenciesData();

	//
	// B. Handle actions

	const handleOpenCalendar = () => {
		router.push(keepUrlParams(PAGE_ROUTES.dates.YEAR_PERIODS_LIST));
	};

	//
	// C. Render components

	return (
		<Section gap="lg">
			<Grid columns="a" gap="lg">
				<StandardFormController
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label="Nome"
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="Ex: Período Escolar 2024/2025"
							readOnly={!capabilities.editEnabled}
							value={field.value ?? ''}
							withAsterisk={!YearPeriodSchema.shape.name.isOptional()}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label="Código"
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="Ex: 1"
							readOnly={!capabilities.editEnabled}
							value={field.value ?? ''}
							withAsterisk={!YearPeriodSchema.shape.code.isOptional()}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="agency_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={agencyOptions}
							error={fieldState.error?.message}
							label="Operadores"
							onBlur={field.onBlur}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
							value={field.value ?? []}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="color"
					render={({ field, fieldState }) => (
						<ColorInput
							error={fieldState.error?.message}
							label="Cor"
							onBlur={field.onBlur}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
							value={field.value ?? ''}
							withAsterisk={!YearPeriodSchema.shape.color.isOptional()}
							withEyeDropper={false}
						/>
					)}
				/>
				<Button label="Atribuir Datas" onClick={handleOpenCalendar} />
			</Grid>
		</Section>
	);
}
