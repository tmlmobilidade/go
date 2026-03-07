/* * */

import { Tooltip } from '@mantine/core';
import { type IconProps } from '@tabler/icons-react';
import React, { forwardRef } from 'react';

import styles from './styles.module.css';

/* * */

export interface TagProps {
	filled?: boolean
	icon?: React.ReactNode
	label?: number | string
	onClick?: () => void
	tooltip?: string
	variant?: 'danger' | 'id' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning'
}

/* * */

const TagBody = forwardRef<HTMLDivElement, TagProps>((props, ref) => (
	<div
		ref={ref}
		className={styles.tag}
		data-clickable={!!props.onClick}
		data-filled={props.filled}
		data-variant={props.variant ?? 'secondary'}
		onClick={props.onClick}
	>
		{React.isValidElement<IconProps>(props.icon) && <span className={styles.icon}>{React.cloneElement(props.icon)}</span>}
		{props.label !== null && props.label !== undefined && <span className={styles.label}>{props.label}</span>}
	</div>
));

/**
 * Tag component used to display a small badge with optional icon and tooltip.
 */
export function Tag(props: TagProps) {
	//

	if (props.tooltip) {
		return (
			<Tooltip label={props.tooltip} withArrow>
				<TagBody {...props} />
			</Tooltip>
		);
	}

	return <TagBody {...props} />;

	//
}
