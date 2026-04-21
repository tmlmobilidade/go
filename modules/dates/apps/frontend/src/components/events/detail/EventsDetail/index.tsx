'use client';

/* * */

import { DatesSelector } from '@/components/events/detail/EventsDatesSelector';
import { useEventsDetailContext } from '@/components/events/detail/EventsDetail.context';
import { EventsDetailHeader } from '@/components/events/detail/EventsDetailHeader';
import { RuleCard } from '@/components/events/rules/RuleCard';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { EventRule, EventSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { Button, Divider, ErrorDisplay, Grid, LoadingOverlay, MultiSelect, Pane, Section, Spacer, Text, Textarea, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function EventsDetail() {
	//

	//
	// A. Setup variables

	const eventsDetailContext = useEventsDetailContext();

	// Bypass permissions to show all agency labels in read-only mode
	// When editable, filter agencies based on user permissions
	const { options: agencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: eventsDetailContext.flags.isReadOnly ? undefined : [PermissionCatalog.all.events.actions.update],
		scope: eventsDetailContext.flags.isReadOnly ? undefined : PermissionCatalog.all.events.scope,
	});

	//
	// B. Render components

	if (eventsDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (eventsDetailContext.flags.error) {
		return <ErrorDisplay message={eventsDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<EventsDetailHeader />]}>
			<Section>
				<Grid columns="a" gap="lg">

					<TextInput
						key={eventsDetailContext.data.form.key('title')}
						label="Título"
						placeholder="Ex: Greve de transportes"
						readOnly={eventsDetailContext.flags.isReadOnly}
						required={!EventSchema.shape.title.isOptional()}
						w="100%"
						{...eventsDetailContext.data.form.getInputProps('title')}
					/>

					<TextInput
						key={eventsDetailContext.data.form.key('code')}
						description={`Deve conter apenas letras maiúsculas, números e underscores. Máximo de ${EventSchema.shape.code.maxLength} caracteres.`}
						label="Código"
						maxLength={EventSchema.shape.code.maxLength}
						placeholder="Ex: MARAT_LIS"
						required={!EventSchema.shape.code.isOptional()}
						value={eventsDetailContext.data.form.values?.code ?? ''}
						w="100%"
						onChange={(e) => {
							const normalized = e.currentTarget.value
								.toUpperCase()
								.replace(/[^A-Z0-9_]/g, '');

							eventsDetailContext.data.form.setFieldValue('code', normalized);
						}}
					/>

					<Textarea
						key={eventsDetailContext.data.form.key('description')}
						label="Descrição"
						placeholder="Descrição da ocorrência"
						readOnly={eventsDetailContext.flags.isReadOnly}
						required={!EventSchema.shape.description.isOptional()}
						w="100%"
						{...eventsDetailContext.data.form.getInputProps('description')}
					/>

					<MultiSelect
						key={eventsDetailContext.data.form.key('agency_ids')}
						data={agencyOptions}
						disabled={eventsDetailContext.flags.isReadOnly}
						label="Operadores afetados"
						required={!EventSchema.shape.agency_ids.isOptional()}
						{...eventsDetailContext.data.form.getInputProps('agency_ids')}
					/>

					<DatesSelector />

					<Divider />

					<Section padding="none">
						<Text size="lg">Regras de oferta</Text>
						<Text c="dimmed" size="sm">Definem como a oferta deve ser calculada nos dias do evento.
							Estas regras substituem o comportamento normal do calendário, permitindo que um dia específico funcione, por exemplo, como Sábado em Período Escolar, independentemente do dia real da semana.
						</Text>

						<Spacer orientation="vertical" size="lg" />

						<Section gap="md" padding="none">
							{(eventsDetailContext.data.form.values.rules as EventRule[] | undefined)?.map(rule => (
								<RuleCard key={rule._id} rule={rule} />
							))}

							{(!eventsDetailContext.data.form.values.rules || eventsDetailContext.data.form.values.rules.length === 0) && (
								<Text c="dimmed" size="sm">Nenhuma regra definida</Text>
							)}
						</Section>

						<Spacer orientation="vertical" size="md" />

						<Button label="Nova regra" onClick={() => eventsDetailContext.actions.openRuleModal()} w="fit-content" />
					</Section>

				</Grid>
			</Section>
		</Pane>
	);

	//
}
