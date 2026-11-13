'use client';

import { IconTag } from '@tabler/icons-react';
import { type AnnotationCategory } from '@tmlmobilidade/go-types-dates';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { annotationCategoryIcons } from '../annotation-category-icons';

/* * */

interface AnnotationsCategoryLabelProps {
	category?: AnnotationCategory | null
}

/* * */

export function AnnotationsCategoryLabel({ category }: AnnotationsCategoryLabelProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const Icon = category ? annotationCategoryIcons[category] : IconTag;
	const label = category ? t(`annotations:categories.values.${category}`) : t('annotations:categories.uncategorized');

	//
	// B. Render components

	return <Tag icon={<Icon size={18} aria-hidden />} label={label} tooltip={label} variant="muted" />;
}
