/* * */

import { forwardRef } from 'react';

import styles from './styles.module.css';

/* * */

interface FilterTargetProps extends React.ComponentPropsWithoutRef<'div'> {
	active?: boolean
	disabled?: boolean
	label: string
	loading?: boolean
}

/* * */

export const FilterTarget = forwardRef<HTMLDivElement, FilterTargetProps>(({ active, disabled, label, loading, ...props }: FilterTargetProps, ref) => (
	<div
		{...props}
		ref={ref}
		className={styles.root}
		data-active={active}
		data-disabled={disabled}
		data-loading={loading}
	>
		{label ?? 'Missing Label!'}
	</div>
));
