'use client';

/* * */

import { default as NextLink, type LinkProps as NextLinkProps } from 'next/link';

/* * */

interface Props extends NextLinkProps {
	children: React.ReactNode
	className?: string
	rel?: string
	target?: string
	track?: boolean
}

/* * */

export function Link({ ...props }: Props) {
	//

	//
	// B. Handle actions

	const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (props.onClick) {
			props.onClick(e);
		}
	};

	//
	// C. Render components

	return (
		<NextLink {...props} onClick={handleLinkClick}>
			{props.children}
		</NextLink>
	);

	//
}
