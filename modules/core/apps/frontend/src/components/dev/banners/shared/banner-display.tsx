'use client';

import { IconCircleFilled } from '@tabler/icons-react';
import { type BannerKind, type BannerSeverity } from '@tmlmobilidade/go-types-core';
import { BANNER_KIND_ICONS, Section } from '@tmlmobilidade/ui';
import { type ReactNode } from 'react';

/* * */

export const BANNER_SEVERITY_COLORS: Record<BannerSeverity, string> = {
	critical: 'var(--color-status-danger-primary)',
	info: 'var(--color-primary)',
	warning: 'var(--color-status-warning-primary)',
};

/* * */

export function BannerKindIcon({ kind }: { kind: BannerKind }) {
	//

	const Icon = BANNER_KIND_ICONS[kind];

	return <Icon size={18} aria-hidden />;
}

/* * */

export function BannerSeverityDot({ severity }: { severity: BannerSeverity }) {
	//

	return <IconCircleFilled color={BANNER_SEVERITY_COLORS[severity]} size={14} aria-hidden />;
}

/* * */

export function BannerDisplayLabel({ color, icon, label }: { color?: string, icon: ReactNode, label: string }) {
	//

	return (
		<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
			{icon}
			<span style={{ color }}>{label}</span>
		</Section>
	);
}
