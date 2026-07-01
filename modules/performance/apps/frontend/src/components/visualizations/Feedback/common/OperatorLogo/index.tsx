/* * */

import Image from 'next/image';

import { getOperatorLogoSrc } from '../../utils/operator-logo';

/* * */

interface OperatorLogoProps {
	className?: string
	height: number
	operatorId: string
	width: number
}

/* * */

export function OperatorLogo({ className, height, operatorId, width }: OperatorLogoProps) {
	const logoSrc = getOperatorLogoSrc(operatorId);
	if (!logoSrc) return null;

	return (
		<Image
			alt={`Logo do operador ${operatorId}`}
			className={className}
			height={height}
			src={logoSrc}
			width={width}
		/>
	);
}
