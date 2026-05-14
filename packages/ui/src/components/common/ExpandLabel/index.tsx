import { Typography } from '@mantine/core';
import { useCollapse, useDisclosure } from '@mantine/hooks';
import { type ReactNode } from 'react';

export interface ExpandLabelProps {
	children: ReactNode
	collapseLabel?: string
	defaultExpanded?: boolean
	expandLabel?: string
}

export function ExpandLabel({
	children,
	defaultExpanded = false,
}: ExpandLabelProps) {
	const [expanded] = useDisclosure(defaultExpanded);
	const { getCollapseProps } = useCollapse({ expanded });

	return (
		<div {...getCollapseProps()}>
			<Typography bdrs="md" bg="var(--color-system-background-100)" p="xs">{children}</Typography>
		</div>
	);
}
