'use client';

import { LinesListContextProvider, useLinesListContext } from '@/components/lines/list/LinesList.context';
import { GtfsExportModalContextProvider, useGtfsExportModalContext } from '@/contexts/GtfsExport.context';
import { IconFileDownload } from '@tabler/icons-react';
import { LinesMode } from '@tmlmobilidade/types';
import { Button, Checkbox, CloseButton, closeModal, DateInput, Divider, Grid, Label, MeContextProvider, MultiSelect, NumberInput, openModal, Section, SegmentedControl, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export const GTFS_EXPORT_MODAL_ID = 'gtfs-export-modal';

/* * */

export const openGtfsExportModal = () => {
	openModal({
		children: (
			<MeContextProvider>
				<LinesListContextProvider>
					<GtfsExportModalContextProvider>
						<GtfsExportModal />
					</GtfsExportModalContextProvider>
				</LinesListContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: GTFS_EXPORT_MODAL_ID,
		padding: 0,
		size: 'xl',
		styles: { content: { overflow: 'scroll' } },
		withCloseButton: false,
	});
};

/* * */

function GtfsExportModal() {
	//

	//
	// A. Setup variables

	const context = useGtfsExportModalContext();
	const linesListContext = useLinesListContext();

	const filteredLines = useMemo(() => {
		return linesListContext.data.raw.filter(line => context.data.form.values.agency_ids.includes(line.agency_id));
	}, [context.data.form.values.agency_ids, linesListContext.data.raw]);

	const linesOptions = useMemo(() => filteredLines.map(line => ({
		label: `${line.code} - ${line.name}`,
		value: line._id,
	})), [filteredLines]);

	//
	// B. Render Components

	return (
		<div style={{ minHeight: '200px' }}>
			<Toolbar>
				<CloseButton onClick={() => closeModal(GTFS_EXPORT_MODAL_ID)} type="close" />
				<Label size="lg" caps singleLine>Exportar GTFS</Label>
				<Spacer />
				<Button
					disabled={!context.flags.canSave}
					icon={<IconFileDownload />}
					label="Exportar"
					loading={context.flags.loading}
					onClick={context.actions.exportGtfs}
				/>
			</Toolbar>

			<Divider />

			<Section gap="md">
				<MultiSelect
					data={linesListContext.data.agencyOptions}
					description="Selecione um ou mais operadores para exportar os dados correspondentes"
					label="Selecionar operadores"
					onChange={context.actions.setAgencyIds}
					placeholder="Selecionar operadores"
					value={context.data.form.values.agency_ids}
					w="100%"
				/>
			</Section>

			<Divider />

			<Section gap="md">
				<Grid columns="ab" gap="md">
					<DateInput
						description="O serviço inicia nesta data, inclusive"
						label="Primeira data do calendário"
						placeholder="YYYYMMDD"
						{...context.data.form.getInputProps('clip_start_date')}
					/>
					<DateInput
						description="O serviço termina nesta data, inclusive"
						label="Última data do calendário"
						placeholder="YYYYMMDD"
						{...context.data.form.getInputProps('clip_end_date')}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="md">
				<Grid columns="ab" gap="md">
					<DateInput
						description="O plano é válido a partir desta data"
						label="Data Feed início"
						placeholder="YYYYMMDD"
						{...context.data.form.getInputProps('feed_start_date')}
					/>
					<DateInput
						description="O plano é válido até esta data"
						label="Data Feed fim"
						placeholder="YYYYMMDD"
						{...context.data.form.getInputProps('feed_end_date')}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="md">
				<SegmentedControl
					onChange={value => context.actions.setLinesMode(value as LinesMode)}
					value={context.data.form.values.lines_mode}
					data={[
						{ label: 'Todas as linhas', value: 'all' },
						{ label: 'Apenas estas linhas', value: 'include' },
						{ label: 'Todas exceto estas', value: 'exclude' },
					]}
				/>

				{context.data.form.values.lines_mode === 'include' && (
					<MultiSelect
						key={context.data.form.key('lines_include')}
						data={linesOptions}
						description="Apenas estas linhas serão exportadas."
						placeholder="Selecionar linhas"
						w="100%"
						{...context.data.form.getInputProps('lines_include')}
					/>
				)}

				{context.data.form.values.lines_mode === 'exclude' && (
					<MultiSelect
						key={context.data.form.key('lines_exclude')}
						data={linesOptions}
						description="Todas as linhas serão exportadas, exceto estas."
						placeholder="Selecionar linhas"
						w="100%"
						{...context.data.form.getInputProps('lines_exclude')}
					/>
				)}

			</Section>

			<Divider />

			<Section gap="md">
				<NumberInput
					defaultValue={1}
					description="As paragens de um percurso são ordenadas sequencialmente por um número inteiro. É recomendado que se inicie a contagem com o número '1', no entanto é possível alterar (por exemplo para '0') em casos específicos."
					label="Base de Contagem da Sequência de Paragens"
					min={0}
					w="100%"
					{...context.data.form.getInputProps('stop_sequence_start')}
				/>
			</Section>

			<Divider />

			<Section gap="md">
				<Checkbox
					checked={context.data.form.values.stops_export_all}
					label="Incluir todas as paragens"
					{...context.data.form.getInputProps('stops_export_all', { type: 'checkbox' })}
				/>
				<Checkbox
					checked={context.data.form.values.numeric_calendar_codes}
					label="Códigos de calendário numéricos"
					{...context.data.form.getInputProps('numeric_calendar_codes', { type: 'checkbox' })}
				/>
			</Section>
		</div>
	);

	//
}
