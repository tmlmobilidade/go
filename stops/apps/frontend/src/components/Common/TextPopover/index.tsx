import { MantineSize, Popover, PopoverProps, Text } from '@mantine/core';
import { useState } from 'react';

import styles from './styles.module.css';

interface ComponentProps extends PopoverProps {
	children?: React.ReactNode
	text: string
	textSize?: MantineSize
}

export default function Component({
	children,
	position = 'bottom',
	shadow = 'md',
	text,
	textSize = 'xs',
	withArrow = true,
	...props
}: ComponentProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={styles.popover}>
			<Popover opened={isOpen} position={position} shadow={shadow} withArrow={withArrow} {...props}>
				<Popover.Target>
					<div onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
						{children}
					</div>
				</Popover.Target>
				<Popover.Dropdown>
					<Text size={textSize}>{text}</Text>
				</Popover.Dropdown>
			</Popover>
		</div>
	);
}
