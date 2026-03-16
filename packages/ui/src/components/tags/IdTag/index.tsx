'use client';

/* * */

import { Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export interface IdTagProps {
	copyOnClick?: boolean
	id?: number | string
}

/* * */

const IdTagBody = forwardRef<HTMLDivElement, IdTagProps & { onClick?: () => void }>((props, ref) => (
	<div
		ref={ref}
		className={styles.idTag}
		data-clickable={!!props.onClick}
		onClick={props.onClick}
	>
		{props.id !== null && props.id !== undefined && <span className={styles.label}>{props.id}</span>}
	</div>
));

/**
 * A tag component that should be used to display an ID.
 * If the `copyOnClick` prop is true, the tag shows a tooltip indicating
 * that the user can copy the ID to the clipboard by clicking it.
 */
export function IdTag(props: IdTagProps) {
	//

	//
	// A. Setup variables

	const clipboard = useClipboard({ timeout: 800 });

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleClick = () => {
		if (!props.id) return;
		if (!props.copyOnClick) return;
		clipboard.copy(String(props.id));
	};

	//
	// C. Render components

	if (!props.copyOnClick) {
		return <IdTagBody {...props} />;
	}

	return (
		<Tooltip label={clipboard.copied ? t('shared:components.tags.IdTag.copied') : t('shared:components.tags.IdTag.copy')} withArrow>
			<IdTagBody {...props} onClick={handleClick} />
		</Tooltip>
	);
}
