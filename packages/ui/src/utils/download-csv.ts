import { asString, download, generateCsv, mkConfig } from 'export-to-csv';

/* * */

export type CsvExportValue = boolean | null | number | string | undefined;

export interface CsvExportColumnHeader {
	displayLabel: string
	key: string
}

export interface CsvExportConfig {
	columnHeaders?: CsvExportColumnHeader[]
	filename: string
	metadata?: CsvExportMetadata[]
}

export interface CsvExportMetadata {
	label: string
	value: CsvExportValue
}

export type CsvExportRow = Record<string, CsvExportValue>;

/* * */

function downloadCsvWithMetadata(csv: string, filename: string): void {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');

	anchor.download = `${filename}.csv`;
	anchor.href = url;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* * */

export function downloadCsv(data: CsvExportRow[], config: CsvExportConfig): void {
	if (!data.length) return;

	const csvConfig = mkConfig({
		columnHeaders: config.columnHeaders,
		escapeFormulas: true,
		filename: config.filename,
	});

	const csv = generateCsv(csvConfig)(data);
	if (config.metadata?.length) {
		const metadataConfig = mkConfig({
			columnHeaders: ['label', 'value'],
			escapeFormulas: true,
			showColumnHeaders: false,
			useBom: false,
		});
		const metadataRows: CsvExportRow[] = config.metadata.map(item => ({
			label: item.label,
			value: item.value,
		}));
		const metadataCsv = asString(generateCsv(metadataConfig)(metadataRows));
		const tableCsv = asString(csv).replace(/^\uFEFF/, '');

		downloadCsvWithMetadata(`\uFEFF${metadataCsv}\r\n${tableCsv}`, config.filename);
		return;
	}

	download(csvConfig)(csv);
}
