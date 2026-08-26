'use client';

/* * */

import { Tooltip } from '@mantine/core';
import clsx from 'clsx';

import styles from './styles.module.css';

import { createQuantityHeatmapScale } from './quantity-scale';

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

interface DataHeatmapBaseProps {
	ariaLabel: string
	cellLayout?: 'fluid' | 'square'
	cells: HeatmapCell[]
	className?: string
	columns: HeatmapAxisItem[]
	emptyLabel?: string
	formatValue?: (value: number) => string
	rows: HeatmapAxisItem[]
}

interface CustomDataHeatmapProps extends DataHeatmapBaseProps {
	getTone: (value: number) => HeatmapTone
	legend?: HeatmapLegendItem[]
	scale?: 'custom'
}

interface QuantityDataHeatmapProps extends DataHeatmapBaseProps {
	getTone?: never
	legend?: never
	scale: 'quantity'
}

export type DataHeatmapProps = CustomDataHeatmapProps | QuantityDataHeatmapProps;

/* * */

export function DataHeatmap(props: DataHeatmapProps) {
	//

	//
	// A. Setup variables

	const { ariaLabel, cellLayout = 'fluid', cells, className, columns, emptyLabel = '—', formatValue = String, rows } = props;

	//
	// B. Transform data

	const cellByCoordinates = new Map(cells.map(cell => [`${cell.rowId}:${cell.columnId}`, cell]));
	const quantityScale = props.scale === 'quantity'
		? createQuantityHeatmapScale(cells.flatMap(cell => cell.value === null ? [] : [cell.value]), formatValue)
		: null;
	const legend = quantityScale?.legend ?? props.legend;

	const getTone = (value: number) => quantityScale?.getTone(value) ?? (props.scale === 'quantity' ? 'neutral' : props.getTone(value));

	//
	// C. Render components

	return (
		<div className={clsx(styles.root, className)} data-cell-layout={cellLayout}>
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

export { createQuantityHeatmapScale } from './quantity-scale';
