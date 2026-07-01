/* * */

import Image from 'next/image';

import { getOperatorLogoSrc } from '../../utils/operator-logo';

/* * */
// se quiser remover por achar pouco reutilizavel, não tem problema :)
// só coloquei porque achei que poderia ficar legal ter o logo do operador em alguns lugares, mas não é essencial

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
