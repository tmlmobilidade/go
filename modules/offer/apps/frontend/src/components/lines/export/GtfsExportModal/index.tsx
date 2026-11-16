'use client';

import { LinesListContextProvider, useLinesListContext } from '@/components/lines/list/LinesList.context';
import { GtfsExportModalContextProvider, useGtfsExportModalContext } from '@/contexts/GtfsExport.context';
import { IconFileDownload } from '@tabler/icons-react';
import { type LinesMode } from '@tmlmobilidade/go-types-offer';
import { Button, Checkbox, CloseButton, closeModal, DateInput, Divider, Grid, Label, MeContextProvider, MultiSelect, NumberInput, openModal, Section, SegmentedControl, Spacer, Toolbar } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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

	const { t } = useTranslation();
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
				<Label size="lg" caps singleLine>{t('lines:export.GtfsExportModal.export_gtfs')}</Label>
				<Spacer />
				<Button
					disabled={!context.flags.canSave}
					icon={<IconFileDownload />}
					label={t('lines:export.GtfsExportModal.export')}
					loading={context.flags.loading}
					onClick={context.actions.exportGtfs}
				/>
			</Toolbar>

			<Divider />

			<Section gap="md">
				<MultiSelect
					data={linesListContext.data.agencyOptions}
					description={t('lines:export.GtfsExportModal.export_agencies_hint')}
					label={t('lines:export.GtfsExportModal.select_agencies')}
					onChange={context.actions.setAgencyIds}
					placeholder={t('lines:export.GtfsExportModal.select_agencies')}
					value={context.data.form.values.agency_ids}
					w="100%"
				/>
			</Section>

			<Divider />

			<Section gap="md">
				<Grid columns="ab" gap="md">
					<DateInput
						description={t('lines:export.GtfsExportModal.calendar_start_hint')}
						label={t('lines:export.GtfsExportModal.calendar_start')}
						placeholder="YYYYMMDD"
						{...context.data.form.getInputProps('clip_start_date')}
					/>
					<DateInput
						description={t('lines:export.GtfsExportModal.calendar_end_hint')}
						label={t('lines:export.GtfsExportModal.calendar_end')}
						placeholder="YYYYMMDD"
						{...context.data.form.getInputProps('clip_end_date')}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section gap="md">
				<Grid columns="ab" gap="md">
					<DateInput
						description={t('lines:export.GtfsExportModal.feed_start_hint')}
						label={t('lines:export.GtfsExportModal.feed_start')}
						placeholder="YYYYMMDD"
						{...context.data.form.getInputProps('feed_start_date')}
					/>
					<DateInput
						description={t('lines:export.GtfsExportModal.feed_end_hint')}
						label={t('lines:export.GtfsExportModal.feed_end')}
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
						{ label: t('lines:export.GtfsExportModal.all_lines'), value: 'all' },
						{ label: t('lines:export.GtfsExportModal.only_lines'), value: 'include' },
						{ label: t('lines:export.GtfsExportModal.except_lines'), value: 'exclude' },
					]}
				/>

				{context.data.form.values.lines_mode === 'include' && (
					<MultiSelect
						key={context.data.form.key('lines_include')}
						data={linesOptions}
						description={t('lines:export.GtfsExportModal.only_lines_hint')}
						placeholder={t('lines:export.GtfsExportModal.select_lines')}
						w="100%"
						{...context.data.form.getInputProps('lines_include')}
					/>
				)}

				{context.data.form.values.lines_mode === 'exclude' && (
					<MultiSelect
						key={context.data.form.key('lines_exclude')}
						data={linesOptions}
						description={t('lines:export.GtfsExportModal.except_lines_hint')}
						placeholder={t('lines:export.GtfsExportModal.select_lines')}
						w="100%"
						{...context.data.form.getInputProps('lines_exclude')}
					/>
				)}

			</Section>

			<Divider />

			<Section gap="md">
				<NumberInput
					defaultValue={1}
					description={t('lines:export.GtfsExportModal.stop_sequence_hint')}
					label={t('lines:export.GtfsExportModal.stop_sequence_start')}
					min={0}
					w="100%"
					{...context.data.form.getInputProps('stop_sequence_start')}
				/>
			</Section>

			<Divider />

			<Section gap="md">
				<Checkbox
					checked={context.data.form.values.stops_export_all}
					label={t('lines:export.GtfsExportModal.all_stops')}
					{...context.data.form.getInputProps('stops_export_all', { type: 'checkbox' })}
				/>
				<Checkbox
					checked={context.data.form.values.numeric_calendar_codes}
					label={t('lines:export.GtfsExportModal.numeric_codes')}
					{...context.data.form.getInputProps('numeric_calendar_codes', { type: 'checkbox' })}
				/>
			</Section>
		</div>
	);

	//
}
