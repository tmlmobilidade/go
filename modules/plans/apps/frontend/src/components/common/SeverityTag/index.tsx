/* * */

import { Tag } from '@tmlmobilidade/ui';

/* * */

interface SeverityTagProps {
	label?: string
	severity: 'error' | 'forbidden' | 'ignore' | 'warning'
}

/* * */

export function SeverityTag({ label, severity }: SeverityTagProps) {
	//

	if (severity === 'error') {
		return <Tag label={label ?? 'Erro'} variant="danger" filled />;
	}

	if (severity === 'forbidden') {
		return <Tag label={label ?? 'Proibido'} variant="danger" filled />;
	}

	if (severity === 'warning') {
		return <Tag label={label ?? 'Aviso'} variant="warning" filled />;
	}

	//
}
