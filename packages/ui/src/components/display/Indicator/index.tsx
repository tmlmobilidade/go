/* * */

import { forwardRef } from 'react';

import styles from './styles.module.css';

import { Tooltip } from '../../common/Tooltip';

/* * */

export interface IndicatorProps {
	color?: string
	filled?: boolean
	size?: 'lg' | 'md' | 'sm'
	tooltip?: string
	variant?: 'danger' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning'
}

/* * */

const IndicatorBody = forwardRef<HTMLDivElement, IndicatorProps>((props, ref) => (
	<div
		ref={ref}
		className={styles.root}
		data-filled={props.filled}
		data-size={props.size}
		data-variant={props.variant}
	>
		<div
			className={styles.indicator}
			style={props.color ? {
				backgroundColor: props.filled ? props.color : 'transparent',
				borderColor: props.color,
			} : undefined}
		/>
	</div>
));

/* * */

export function Indicator(props: IndicatorProps) {
	//

	if (props.tooltip) {
		return (
			<Tooltip label={props.tooltip} withArrow>
				<IndicatorBody {...props} />
			</Tooltip>
		);
	}

	return <IndicatorBody {...props} />;

	//
}
