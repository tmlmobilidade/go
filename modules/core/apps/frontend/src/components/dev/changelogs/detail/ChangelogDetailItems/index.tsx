'use client';

import { IconPlus } from '@tabler/icons-react';
import { type ChangelogItemCategory, ChangelogItemCategoryValues } from '@tmlmobilidade/go-types-core';
import { Button, CHANGELOG_CATEGORY_ICONS, Collapsible, Label, Section, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { sortChangelogItemsByCategory } from '../changelog-items';
import { useChangelogDetailFormContext } from '../ChangelogDetailForm.context';
import { ChangelogDetailItem } from '../ChangelogDetailItem';

/* * */

export function ChangelogDetailItems() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useChangelogDetailFormContext();
	const items = useStandardFormWatch({ control: form.control, name: 'items' }) ?? [];

	//
	// B. Handle actions

	const handleAdd = (category: ChangelogItemCategory) => {
		const next = [...items, { _id: crypto.randomUUID(), category, description: null, title: '' }];
		form.setValue('items', sortChangelogItemsByCategory(next), { shouldDirty: true });
	};

	//
	// C. Render components

	return (
		<Collapsible title={t('default:dev.fields.changes')} defaultOpen>
			<Section gap="lg">
				{!items.length && <Label variant="muted">{t('default:dev.hints.emptyChanges')}</Label>}
				{ChangelogItemCategoryValues.map((category) => {
					const Icon = CHANGELOG_CATEGORY_ICONS[category];
					const group = items.map((item, index) => ({ index, item })).filter(entry => entry.item.category === category);
					return (
						<Section key={category} gap="sm" padding="none">
							<div className={styles.header}>
								<Icon size={18} />
								<Label>{`${t(`shared:components.changelog.categories.${category}`)} (${group.length})`}</Label>
							</div>
							{group.map((entry, position) => (
								<ChangelogDetailItem key={entry.item._id} id={entry.item._id} index={entry.index} isFirst={position === 0} isLast={position === group.length - 1} />
							))}
							<Button
								disabled={!capabilities?.editEnabled}
								icon={<IconPlus size={16} />}
								label={t(`default:dev.actions.addChange.${category}`)}
								onClick={() => handleAdd(category)}
								variant="secondary"
							/>
						</Section>
					);
				})}
			</Section>
		</Collapsible>
	);
}
