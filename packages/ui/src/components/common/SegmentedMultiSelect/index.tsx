'use client';

/* * */

import styles from './styles.module.css';

import { cn } from '../../../lib/utils';

/* * */

export type SegmentedValue = number | string;

export interface SegmentedOption<T extends SegmentedValue> {
	ariaLabel?: string
	label: string
	value: T
}

export interface SegmentedMultiSelectProps<T extends SegmentedValue> {
	className?: string
	fullWidth?: boolean
	onChange?: (value: T[]) => void
	options: SegmentedOption<T>[]
	size?: 'md' | 'sm'
	title?: string
	value?: T[]
}

/* * */

export function SegmentedMultiSelect<T extends SegmentedValue>({
	className,
	fullWidth = true,
	onChange,
	options,
	size = 'md',
	title,
	value = [],
}: SegmentedMultiSelectProps<T>) {
	const toggle = (v: T) => {
		const next = value.includes(v) ? value.filter(x => x !== v) : [...value, v];
		onChange?.(next);
	};

	return (
		<div className={cn(styles.card, fullWidth && styles.fullWidth, className)}>
			{title && <div className={styles.title}>{title}</div>}

			<div aria-label={title ?? 'Selector'} className={styles.bar} role="group">
				{options.map((opt) => {
					const selected = value.includes(opt.value);
					return (
						<button
							key={opt.value}
							aria-label={opt.ariaLabel ?? opt.label}
							aria-pressed={selected}
							className={cn(styles.segment, styles[size], selected && styles.selected)}
							onClick={() => toggle(opt.value)}
							type="button"
						>
							{opt.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}
