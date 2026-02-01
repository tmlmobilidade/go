/* * */

import { forwardRef } from 'react';

import styles from './styles.module.css';

import { Tooltip } from '../../common/Tooltip';

/* * */

export interface IndicatorProps {
	filled?: boolean
	tooltip?: string
	variant?: 'danger' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning'
}

/* * */

const IndicatorBody = forwardRef<HTMLDivElement, IndicatorProps>((props, ref) => (
	<div
		ref={ref}
		className={styles.root}
		data-filled={props.filled}
		data-variant={props.variant}
	>
		<div className={styles.indicator} />
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
