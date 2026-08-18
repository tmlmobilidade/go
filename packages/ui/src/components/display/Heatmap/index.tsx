'use client';

/* * */

import { Tooltip } from '@mantine/core';
import clsx from 'clsx';

import styles from './styles.module.css';

/* * */

export type HeatmapTone = 'critical' | 'high' | 'intensity-1' | 'intensity-2' | 'intensity-3' | 'intensity-4' | 'intensity-5' | 'low' | 'medium' | 'neutral' | 'positive';

export interface HeatmapAxisItem {
	id: string
	label: string
}

export interface HeatmapCell {
	columnId: string
	rowId: string
	value: null | number
}

export interface HeatmapLegendItem {
	label: string
	tone: HeatmapTone
}

export interface HeatmapProps {
	ariaLabel: string
	cells: HeatmapCell[]
	className?: string
	columns: HeatmapAxisItem[]
	emptyLabel?: string
	formatValue?: (value: number) => string
	getTone: (value: number) => HeatmapTone
	legend?: HeatmapLegendItem[]
	rows: HeatmapAxisItem[]
}

/* * */

export function Heatmap({ ariaLabel, cells, className, columns, emptyLabel = '—', formatValue = String, getTone, legend, rows }: HeatmapProps) {
	//

	//
	// A. Transform data

	const cellByCoordinates = new Map(cells.map(cell => [`${cell.rowId}:${cell.columnId}`, cell]));

	//
	// B. Render components

	return (
		<div className={clsx(styles.root, className)}>
			<div className={styles.scrollArea}>
				<table aria-label={ariaLabel} className={styles.table}>
					<thead>
						<tr>
							<th aria-hidden="true" className={styles.corner} />
							{columns.map(column => <th key={column.id} scope="col">{column.label}</th>)}
						</tr>
					</thead>
					<tbody>
						{rows.map(row => (
							<tr key={row.id}>
								<th scope="row">{row.label}</th>
								{columns.map((column) => {
									const cell = cellByCoordinates.get(`${row.id}:${column.id}`);
									const formattedValue = cell?.value === null || cell?.value === undefined ? emptyLabel : formatValue(cell.value);
									const tone = cell?.value === null || cell?.value === undefined ? 'neutral' : getTone(cell.value);
									const accessibleLabel = `${String(row.label)}, ${String(column.label)}: ${formattedValue}`;

									return (
										<td key={column.id}>
											<Tooltip label={accessibleLabel} withArrow>
												<span aria-label={accessibleLabel} className={styles.cell} data-tone={tone} role="img" tabIndex={0} />
											</Tooltip>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{legend?.length ? (
				<ul className={styles.legend}>
					{legend.map(item => (
						<li key={`${item.tone}:${item.label}`}>
							<span aria-hidden="true" className={styles.swatch} data-tone={item.tone} />
							<span>{item.label}</span>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);

	//
}
