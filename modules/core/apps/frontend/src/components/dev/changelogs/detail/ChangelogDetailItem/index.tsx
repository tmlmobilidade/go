'use client';

import { IconArrowDown, IconArrowUp, IconTrash } from '@tabler/icons-react';
import { IconButton, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { moveChangelogItem } from '../changelog-items';
import { useChangelogDetailFormContext } from '../ChangelogDetailForm.context';

/* * */

interface ChangelogDetailItemProps {
	id: string
	index: number
	isFirst: boolean
	isLast: boolean
}

/* * */

export function ChangelogDetailItem({ id, index, isFirst, isLast }: ChangelogDetailItemProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useChangelogDetailFormContext();
	const options = { shouldDirty: true, shouldValidate: form.formState.isSubmitted };

	//
	// B. Handle actions

	const handleMove = (offset: -1 | 1) => form.setValue('items', moveChangelogItem(form.getValues('items') ?? [], id, offset), options);

	const handleRemove = () => form.setValue('items', (form.getValues('items') ?? []).filter(item => item._id !== id), options);

	//
	// C. Render components

	return (
		<Section className={styles.root} gap="sm">
			<div className={styles.header}>
				<StandardFormController
					control={form.control}
					name={`items.${index}.title`}
					render={({ field, fieldState }) => (
						<TextInput
							className={styles.title}
							error={fieldState.error?.message}
							label={t('default:dev.fields.title')}
							onChange={field.onChange}
							readOnly={!capabilities?.editEnabled}
							value={field.value}
							withAsterisk
						/>
					)}
				/>
				<div className={styles.actions}>
					<IconButton icon={<IconArrowUp size={18} />} isDisabled={!capabilities?.editEnabled || isFirst} onClick={() => handleMove(-1)} tooltip={t('default:dev.actions.up')} />
					<IconButton icon={<IconArrowDown size={18} />} isDisabled={!capabilities?.editEnabled || isLast} onClick={() => handleMove(1)} tooltip={t('default:dev.actions.down')} />
					<IconButton icon={<IconTrash size={18} />} isDisabled={!capabilities?.editEnabled} onClick={handleRemove} tooltip={t('default:dev.actions.remove')} variant="danger" />
				</div>
			</div>
			<StandardFormController
				control={form.control}
				name={`items.${index}.description`}
				render={({ field, fieldState }) => (
					<Textarea
						error={fieldState.error?.message}
						label={t('default:dev.fields.description')}
						minRows={2}
						onChange={event => field.onChange(event.currentTarget.value || null)}
						readOnly={!capabilities?.editEnabled}
						value={field.value ?? ''}
						w="100%"
						autosize
					/>
				)}
			/>
		</Section>
	);
}
