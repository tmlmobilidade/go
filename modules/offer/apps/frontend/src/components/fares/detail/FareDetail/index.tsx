'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useFareDetailContext } from '@/components/fares/detail/FareDetail.context';
import { FareDetailHeader } from '@/components/fares/detail/FareDetailHeader';
import { currencyOptions, paymentMethodsOptions, transfersOptions } from '@/types/fares';
import { FareSchema } from '@tmlmobilidade/go-types-offer';
import { ErrorDisplay, Grid, LoadingOverlay, MultiSelect, NumberInput, Pane, Section, Select, TextInput } from '@tmlmobilidade/ui';

/* * */

export function FareDetail() {
	//

	//
	// A. Setup variables

	const fareDetailContext = useFareDetailContext();

	const { options: agencyOptions } = useAgenciesData();

	//
	// B. Render components

	if (fareDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (fareDetailContext.flags.error) {
		return <ErrorDisplay message={fareDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<FareDetailHeader key="header" />]}>
			<Section>
				<Grid columns="a" gap="lg">

					<TextInput
						key={fareDetailContext.data.form.key('name')}
						disabled={fareDetailContext.flags.isReadOnly}
						label="Nome"
						placeholder="Ex: navegante® a bordo T1"
						required={!FareSchema.shape.name.isOptional()}
						w="100%"
						{...fareDetailContext.data.form.getInputProps('name')}
					/>

					<TextInput
						key={fareDetailContext.data.form.key('code')}
						disabled={fareDetailContext.flags.isReadOnly}
						label="Código"
						placeholder="Ex: T1-BORDO"
						required={!FareSchema.shape.code.isOptional()}
						w="100%"
						{...fareDetailContext.data.form.getInputProps('code')}
					/>

					<Grid columns="ab" gap="lg">
						<NumberInput
							key={fareDetailContext.data.form.key('price')}
							disabled={fareDetailContext.flags.isReadOnly}
							label="Preço"
							required={!FareSchema.shape.price.isOptional()}
							w="100%"
							{...fareDetailContext.data.form.getInputProps('price')}
						/>

						<Select
							key={fareDetailContext.data.form.key('currency_type')}
							data={currencyOptions}
							disabled={fareDetailContext.flags.isReadOnly}
							label="Moeda"
							required={!FareSchema.shape.currency_type.isOptional()}
							searchable={false}
							w="100%"
							{...fareDetailContext.data.form.getInputProps('currency_type')}
						/>
					</Grid>

					<Select
						key={fareDetailContext.data.form.key('payment_method')}
						data={paymentMethodsOptions}
						disabled={fareDetailContext.flags.isReadOnly}
						label="Método de Pagamento"
						required={!FareSchema.shape.payment_method.isOptional()}
						searchable={false}
						w="100%"
						{...fareDetailContext.data.form.getInputProps('payment_method')}
					/>

					<Select
						key={fareDetailContext.data.form.key('transfers')}
						data={transfersOptions}
						disabled={fareDetailContext.flags.isReadOnly}
						label="Transbordos"
						required={!FareSchema.shape.transfers.isOptional()}
						searchable={false}
						w="100%"
						{...fareDetailContext.data.form.getInputProps('transfers')}
					/>

					<MultiSelect
						key={fareDetailContext.data.form.key('agency_ids')}
						data={agencyOptions}
						disabled={fareDetailContext.flags.isReadOnly}
						label="Operadores"
						{...fareDetailContext.data.form.getInputProps('agency_ids')}
					/>

				</Grid>
			</Section>
		</Pane>
	);

	//
}
