'use client';

import { IconExternalLink, IconLink, IconTrash } from '@tabler/icons-react';
import { type AnnotationSource, AnnotationSourceSchema, AnnotationSourceUrlSchema } from '@tmlmobilidade/go-types-dates';
import { createValidationResolver } from '@tmlmobilidade/go-utils-validation';
import { Button, Section, Text, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AnnotationsSourceRowProps {
	onChange: (value: AnnotationSource) => void
	onRemove: () => void
	readOnly: boolean
	value: AnnotationSource
}

/* * */

export function AnnotationsSourceRow({ onChange, onRemove, readOnly, value }: AnnotationsSourceRowProps) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const errors = createValidationResolver(AnnotationSourceSchema, i18n.resolvedLanguage ?? i18n.language)(value);
	const parsedUrl = AnnotationSourceUrlSchema.safeParse(value.url);
	const href = parsedUrl.success ? parsedUrl.data : undefined;
	const displayName = value.name || (href ? new URL(href).hostname : '');

	//
	// B. Render components

	return (
		<Section className={styles.row} gap="sm" padding="md">
			{readOnly ? (
				href ? <a className={styles.link} href={href} rel="noopener noreferrer" target="_blank">{displayName}<IconExternalLink size={16} aria-hidden /></a> : <Text>{displayName}</Text>
			) : (
				<>
					<TextInput
						error={errors.name}
						label={t('annotations:AnnotationsSourceRow.name')}
						onChange={event => onChange({ ...value, name: event.currentTarget.value })}
						placeholder={t('annotations:AnnotationsSourceRow.name_placeholder')}
						value={value.name}
						w="100%"
					/>
					<TextInput
						error={errors.url}
						label={t('annotations:AnnotationsSourceRow.url')}
						leftSection={<IconLink size={16} aria-hidden />}
						onChange={event => onChange({ ...value, url: event.currentTarget.value || null })}
						placeholder={t('annotations:AnnotationsSourceRow.url_placeholder')}
						value={value.url ?? ''}
						w="100%"
					/>
					<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
						{href && <a className={styles.link} href={href} rel="noopener noreferrer" target="_blank"><IconExternalLink size={16} aria-hidden />{t('annotations:AnnotationsSourceRow.open')}</a>}
						<Button label={t('annotations:AnnotationsSourceRow.remove')} leftSection={<IconTrash size={16} />} onClick={onRemove} size="xs" variant="transparent" />
					</Section>
				</>
			)}
		</Section>
	);
}
