'use client';

/* * */

import { AgenciesContextProvider, useAgenciesContext } from '@/contexts/Agencies.context';
import { SamsListContextState } from '@/contexts/SamList.context';
import { SAM_EXPORT_MODAL_ID, SamsExportContextProvider, type SamsExportSummaryFilter, useSamsExportContext } from '@/contexts/SamsExport.context';
import { translateFilterKey, translateFilterValue } from '@/lib/translations';
import { IconFileDownload } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { type SamsAnalysisExportProperties, type SystemStatus, UnixTimestamp } from '@tmlmobilidade/types';
import { Button, CloseButton, closeModal, Divider, ExportsContextProvider, Label, MeContextProvider, openModal, Section, Spacer, Text, Toolbar } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export { SAM_EXPORT_MODAL_ID };

/* * */

interface SamsExportModalListPayload {
	favoritesEnabled: boolean
	filters: SamsListContextState['filters']
	samIds: number[]
	source?: 'list'
}

interface SamsExportModalDetailPayload {
	analysisApexVersions: string[]
	analysisFilterEndTime: null | UnixTimestamp
	analysisFilterStartTime: null | UnixTimestamp
	favoritesEnabled?: boolean
	samId: number
	source: 'detail'
}

type SamsExportModalPayload = SamsExportModalDetailPayload | SamsExportModalListPayload;

function normalizeSamsExportPayload(payload: SamsExportModalPayload): {
	exportProperties: Partial<SamsAnalysisExportProperties['properties']>
	favoritesEnabled: boolean
	samIds: number[]
	summaryFilters: SamsExportSummaryFilter[]
} {
	if (payload.source === 'detail') {
		const apexVersions = payload.analysisApexVersions.filter(value => value.trim().length > 0);
		const summaryFilters: SamsExportSummaryFilter[] = [
			{ key: 'sam_id', value: payload.samId },
		];
		if (apexVersions.length > 0) summaryFilters.push({ key: 'apex_version', value: apexVersions });
		if (payload.analysisFilterStartTime != null) summaryFilters.push({ key: 'start_time', value: payload.analysisFilterStartTime });
		if (payload.analysisFilterEndTime != null) summaryFilters.push({ key: 'end_time', value: payload.analysisFilterEndTime });

		return {
			exportProperties: {
				apex_versions: apexVersions.length > 0 ? apexVersions : undefined,
				end_time: payload.analysisFilterEndTime ?? undefined,
				sam_ids: [payload.samId],
				start_time: payload.analysisFilterStartTime ?? undefined,
			},
			favoritesEnabled: payload.favoritesEnabled ?? false,
			samIds: [payload.samId],
			summaryFilters,
		};
	}

	const hasAgencyFilter = payload.filters.agency.isActive && payload.filters.agency.value.length > 0;
	const hasApexFilter = payload.filters.apex_version.isActive && payload.filters.apex_version.value.length > 0;
	const search = payload.filters.search.value.trim();
	const hasSearchFilter = search.length > 0;
	const hasSeenFilter = payload.filters.seen_first_at != null || payload.filters.seen_last_at != null;
	const hasStatusFilter = payload.filters.status.isActive && payload.filters.status.value.length > 0;
	const hasListFilters = hasAgencyFilter || hasApexFilter || hasSearchFilter || hasSeenFilter || hasStatusFilter;
	const shouldUseSamIds = payload.favoritesEnabled || !hasListFilters;

	const summaryFilters: SamsExportSummaryFilter[] = [];
	if (hasAgencyFilter) summaryFilters.push({ key: 'agency', value: payload.filters.agency.value });
	if (hasApexFilter) summaryFilters.push({ key: 'apex_version', value: payload.filters.apex_version.value });
	if (hasSearchFilter) summaryFilters.push({ key: 'search', value: search });
	if (payload.filters.seen_first_at != null) summaryFilters.push({ key: 'seen_first_at', value: payload.filters.seen_first_at });
	if (payload.filters.seen_last_at != null) summaryFilters.push({ key: 'seen_last_at', value: payload.filters.seen_last_at });
	if (hasStatusFilter) summaryFilters.push({ key: 'status', value: payload.filters.status.value });

	return {
		exportProperties: {
			agency_ids: hasAgencyFilter ? payload.filters.agency.value : undefined,
			apex_versions: hasApexFilter ? payload.filters.apex_version.value : undefined,
			sam_ids: shouldUseSamIds ? payload.samIds : undefined,
			search: hasSearchFilter ? search : undefined,
			seen_first_at: payload.filters.seen_first_at ?? undefined,
			seen_last_at: payload.filters.seen_last_at ?? undefined,
			statuses: hasStatusFilter ? payload.filters.status.value as SystemStatus[] : undefined,
		},
		favoritesEnabled: payload.favoritesEnabled,
		samIds: payload.samIds,
		summaryFilters,
	};
}

export const openSamExportModal = (payload: SamsExportModalPayload) => {
	const normalizedPayload = normalizeSamsExportPayload(payload);

	openModal({
		children: (
			<MeContextProvider>
				<ExportsContextProvider>
					<AgenciesContextProvider>
						<SamsExportContextProvider
							favoritesEnabled={normalizedPayload.favoritesEnabled}
							initialExportProperties={normalizedPayload.exportProperties}
							initialSummaryFilters={normalizedPayload.summaryFilters}
							samIds={normalizedPayload.samIds}
						>
							<SamsExportModal />
						</SamsExportContextProvider>
					</AgenciesContextProvider>
				</ExportsContextProvider>
			</MeContextProvider>
		),
		closeOnClickOutside: false,
		modalId: SAM_EXPORT_MODAL_ID,
		padding: 0,
		size: 'xl',
		styles: { content: { overflow: 'scroll' } },
		withCloseButton: false,
	});
};

/* * */

export default function SamsExportModal() {
	//

	//
	// A. Setup variables

	const context = useSamsExportContext();
	const agenciesContext = useAgenciesContext();
	const { t } = useTranslation();

	//
	// B. Transform data

	const agencyMap = useMemo(() => {
		const map = new Map<string, string>();
		agenciesContext.data.raw.forEach((agency) => {
			map.set(agency._id, agency.name);
		});
		return map;
	}, [agenciesContext.data.raw]);

	const getFormattedValue = (key: string, value: number | string | string[]): string => {
		if (Array.isArray(value)) {
			return value.map((v) => {
				if (key === 'agency') {
					return agencyMap.get(v) || v;
				}
				return translateFilterValue(key, v);
			}).join(', ');
		}
		return translateFilterValue(key, String(value));
	};

	const isEmptyFilterValue = (value: number | string | string[]) => {
		if (Array.isArray(value)) return value.length === 0;
		if (typeof value === 'string') return value.trim().length === 0;
		return false;
	};

	//
	// C. Render Components

	return (
		<div style={{ minHeight: '200px' }}>
			<Toolbar>
				<CloseButton onClick={() => closeModal(SAM_EXPORT_MODAL_ID)} type="close" />
				<Label size="lg" caps singleLine>{t('default:sams.export.SamsExportModal.title')}</Label>
				<Spacer />
				<Button
					disabled={!context.flags.canSave}
					icon={<IconFileDownload />}
					label={t('default:sams.export.SamsExportModal.ExportButton.label')}
					loading={context.flags.loading}
					onClick={context.actions.exportSams}
				/>
			</Toolbar>

			<Divider />

			<Section gap="sm">
				{context.filters.map(({ key, value }) => {
					if (key === 'seen_first_at' || key === 'seen_last_at' || key === 'start_time' || key === 'end_time') {
						return (
							<div key={key}>
								<Label size="sm" caps>{translateFilterKey(key)}</Label>
								<Text size="sm">{Dates.fromUnixTimestamp(value as UnixTimestamp).iso}</Text>
							</div>
						);
					}
					if (isEmptyFilterValue(value)) return null;
					return (
						<div key={key}>
							<Label size="sm" caps>{translateFilterKey(key)}</Label>
							<Text size="sm">{getFormattedValue(key, value)}</Text>
						</div>
					);
				})}
			</Section>
		</div>
	);

	//
}
