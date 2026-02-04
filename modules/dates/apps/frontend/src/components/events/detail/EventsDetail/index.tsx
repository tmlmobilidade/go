'use client';

/* * */

import { DatesSelector } from '@/components/events/detail/EventsDatesSelector';
import { useEventsDetailContext } from '@/components/events/detail/EventsDetail.context';
import { EventsDetailHeader } from '@/components/events/detail/EventsDetailHeader';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { EventSchema, LinesMode, PermissionCatalog } from '@tmlmobilidade/types';
import { Checkbox, ErrorDisplay, Grid, LoadingOverlay, MultiSelect, Pane, Section, SegmentedControl, Text, Textarea, TextInput, TimeInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';

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

	const agencyIds = eventsDetailContext.data.form.values.agency_ids ?? [];

	const linesOptions = useMemo(() => {
		const set = new Set(agencyIds);
		return (eventsDetailContext.data.lines ?? [])
			.filter(line => set.has(line.agency_id))
			.map(line => ({
				label: `${line.code} - ${line.name}`,
				value: line._id,
			}));
	}, [eventsDetailContext.data.lines, agencyIds]);

	// Prune lines_to_include/exclude when agency_ids or available lines change
	useEffect(() => {
		// Skip if lines data is not yet loaded to avoid clearing valid IDs during initial load
		if (!eventsDetailContext.data.lines || eventsDetailContext.data.lines.length === 0) return;

		const form = eventsDetailContext.data.form;
		const agencyIds = form.values.agency_ids ?? [];

		const allowed = new Set(
			eventsDetailContext.data.lines
				.filter(l => agencyIds.includes(l.agency_id))
				.map(l => l._id),
		);

		if (form.values.lines_mode === 'include') {
			const cur = form.values.lines_to_include ?? [];
			const next = cur.filter(id => allowed.has(id));
			if (next.length !== cur.length) form.setFieldValue('lines_to_include', next);
		}

		if (form.values.lines_mode === 'exclude') {
			const cur = form.values.lines_to_exclude ?? [];
			const next = cur.filter(id => allowed.has(id));
			if (next.length !== cur.length) form.setFieldValue('lines_to_exclude', next);
		}
	}, [eventsDetailContext.data.lines, eventsDetailContext.data.form.values.agency_ids]);

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
						{...eventsDetailContext.data.form.getInputProps('agency_ids')}
					/>

					<DatesSelector />

					<Checkbox
						key={eventsDetailContext.data.form.key('all_day')}
						disabled={eventsDetailContext.flags.isReadOnly}
						label="Evento de dia completo"
						{...eventsDetailContext.data.form.getInputProps('all_day', { type: 'checkbox' })}
					/>

					{!eventsDetailContext.data.form.values.all_day && (
						<Grid columns="ab" gap="sm">
							<TimeInput
								key={eventsDetailContext.data.form.key('start_time')}
								label="Hora de início"
								readOnly={eventsDetailContext.flags.isReadOnly}
								{...eventsDetailContext.data.form.getInputProps('start_time')}
							/>

							<TimeInput
								key={eventsDetailContext.data.form.key('end_time')}
								label="Hora de fim"
								readOnly={eventsDetailContext.flags.isReadOnly}
								{...eventsDetailContext.data.form.getInputProps('end_time')}
							/>
						</Grid>
					)}

					<SegmentedControl
						key={eventsDetailContext.data.form.key('lines_mode')}
						disabled={eventsDetailContext.flags.isReadOnly}
						value={eventsDetailContext.data.form.values.lines_mode}
						data={[
							{ label: 'Não afeta linhas', value: 'none' },
							{ label: 'Afeta todas as linhas', value: 'all' },
							{ label: 'Incluir linhas', value: 'include' },
							{ label: 'Excluir linhas', value: 'exclude' },
						]}
						onChange={(value) => {
							eventsDetailContext.data.form.setFieldValue('lines_mode', value as LinesMode);

							if (value !== 'include') eventsDetailContext.data.form.setFieldValue('lines_to_include', []);
							if (value !== 'exclude') eventsDetailContext.data.form.setFieldValue('lines_to_exclude', []);
						}}
					/>

					{eventsDetailContext.data.form.values.lines_mode === 'include' && (
						<MultiSelect
							key={eventsDetailContext.data.form.key('lines_to_include')}
							data={linesOptions}
							description="Apenas estas linhas serão afetadas."
							label="Linhas afetadas"
							{...eventsDetailContext.data.form.getInputProps('lines_to_include')}
						/>
					)}

					{eventsDetailContext.data.form.values.lines_mode === 'exclude' && (
						<MultiSelect
							key={eventsDetailContext.data.form.key('lines_to_exclude')}
							data={linesOptions}
							description="Todas as linhas serão afetadas, exceto estas."
							label="Linhas não afetadas"
							{...eventsDetailContext.data.form.getInputProps('lines_to_exclude')}
						/>
					)}

					<Text c="dimmed" size="sm">
						Esta ocorrência pode <b>suspender a oferta</b> num intervalo horário ou durante todo o dia.
						<br />
						{eventsDetailContext.data.form.values.all_day ? (
							<>• <b>Dia completo</b>: todas as viagens são afetadas durante as datas selecionadas.</>
						) : (
							<>
								• Apenas afeta viagens cuja hora esteja entre{' '}
								<b>{eventsDetailContext.data.form.values.start_time || '…'}</b> e{' '}
								<b>{eventsDetailContext.data.form.values.end_time || '…'}</b>.
							</>
						)}
						<br />
						• <b>Não afeta linhas</b>: a ocorrência não altera a oferta.
						<br />
						• <b>Todas as linhas</b>: toda a oferta é suspensa no intervalo definido.
						<br />
						• <b>Incluir linhas</b>: apenas as linhas selecionadas são afetadas.
						<br />
						• <b>Excluir linhas</b>: todas as linhas são afetadas, exceto as selecionadas.
					</Text>

				</Grid>
			</Section>
		</Pane>
	);

	//
}
