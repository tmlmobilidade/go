'use client';

import { FareSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, MultiSelect, NumberInput, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useFaresAgenciesData } from '../../shared/use-fares-agencies-data';
import { useFaresOptions } from '../../shared/use-fares-options';
import { useFaresDetailFormContext } from '../FaresDetailForm.context';

/* * */

export function FareDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useFaresDetailFormContext();
	const { currencyOptions, paymentMethodOptions, transferOptions } = useFaresOptions();
	const { error, isLoading, options } = useFaresAgenciesData({ permissions: capabilities.editEnabled ? { actions: [PermissionCatalog.all.fares.actions.update], scope: PermissionCatalog.all.fares.scope } : undefined });

	//
	// B. Render components

	return (
		<Section gap="md">
			{error && <ErrorDisplay message={error} />}

			<StandardFormController
				control={form.control}
				name="name"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:fares.fields.name.label')}
						maxLength={FareSchema.shape.name.maxLength}
						onChange={field.onChange}
						placeholder={t('default:fares.fields.name.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!FareSchema.shape.name.isOptional()}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="code"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:fares.fields.code.label')}
						maxLength={FareSchema.shape.code.maxLength}
						onChange={field.onChange}
						placeholder={t('default:fares.fields.code.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!FareSchema.shape.code.isOptional()}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="price"
				render={({ field, fieldState }) => (
					<NumberInput
						error={fieldState.error?.message}
						label={t('default:fares.fields.price.label')}
						min={0}
						onChange={field.onChange}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? 0}
						w="100%"
						withAsterisk={!FareSchema.shape.price.isOptional()}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="currency_type"
				render={({ field, fieldState }) => (
					<Select
						allowDeselect={false}
						data={currencyOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:fares.fields.currency_type.label')}
						onChange={field.onChange}
						searchable={false}
						value={field.value ?? null}
						w="100%"
						withAsterisk={!FareSchema.shape.currency_type.isOptional()}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="payment_method"
				render={({ field, fieldState }) => (
					<Select
						allowDeselect={false}
						data={paymentMethodOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:fares.fields.payment_method.label')}
						onChange={field.onChange}
						searchable={false}
						value={field.value ?? null}
						w="100%"
						withAsterisk={!FareSchema.shape.payment_method.isOptional()}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="transfers"
				render={({ field, fieldState }) => (
					<Select
						allowDeselect={false}
						data={transferOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('default:fares.fields.transfers.label')}
						onChange={field.onChange}
						searchable={false}
						value={field.value ?? null}
						w="100%"
						withAsterisk={!FareSchema.shape.transfers.isOptional()}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="agency_ids"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={options}
						disabled={!capabilities.editEnabled || isLoading || !!error}
						error={fieldState.error?.message}
						label={t('default:fares.fields.agency_ids.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
						withAsterisk={!FareSchema.shape.agency_ids.isOptional()}
					/>
				)}
			/>
		</Section>
	);
}
