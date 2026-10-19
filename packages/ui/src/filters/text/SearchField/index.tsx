'use client';

import { Input, TextInput as MantineTextInput, Pill, PillsInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { deserializeSearchTags, isSearchTag, serializeSearchTags } from './search-tags';

/* * */

export interface SearchFieldProps {
	onChange: (value: string) => void
	placeholder?: string
	size?: 'sm' | 'xl'
	/**
	 * When set, tokens that start with one of these prefixes (e.g. `v:`, `d:`, `l:`)
	 * become removable pills when the user presses Space.
	 */
	tagPrefixes?: string[]
	value?: null | string
}

/* * */

export function SearchField({ onChange, placeholder, size = 'sm', tagPrefixes, value }: SearchFieldProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const resolvedPlaceholder = placeholder ?? t('shared:components.inputs.SearchField.placeholder');
	const iconSize = size === 'xl' ? 28 : 20;
	const hasTags = Boolean(tagPrefixes?.length);

	const [focused, setFocused] = useState(false);
	const [tags, setTags] = useState<string[]>(() =>
		hasTags ? deserializeSearchTags(value ?? '', tagPrefixes ?? []).tags : [],
	);
	const [draft, setDraft] = useState(() =>
		hasTags ? deserializeSearchTags(value ?? '', tagPrefixes ?? []).draft : '',
	);

	//
	// B. Sync from controlled value when not editing

	useEffect(() => {
		if (!hasTags || focused) return;
		const next = deserializeSearchTags(value ?? '', tagPrefixes ?? []);
		setTags(next.tags);
		setDraft(next.draft);
	}, [value, tagPrefixes, hasTags, focused]);

	//
	// C. Handle actions

	const formatTagLabel = (tag: string): string => {
		const separatorIndex = tag.indexOf(':');
		if (separatorIndex <= 0) return tag;

		const prefix = tag.slice(0, separatorIndex);
		const values = tag.slice(separatorIndex + 1);
		const label = t(`shared:components.inputs.SearchField.tags.${prefix}`, { defaultValue: prefix });

		return `${label}: ${values}`;
	};

	const emit = (nextTags: string[], nextDraft: string) => {
		setTags(nextTags);
		setDraft(nextDraft);
		onChange(serializeSearchTags(nextTags, nextDraft));
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	};

	const handleClear = () => {
		if (hasTags) emit([], '');
		else onChange('');
	};

	const handleDraftChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const nextDraft = event.currentTarget.value;
		setDraft(nextDraft);
		onChange(serializeSearchTags(tags, nextDraft));
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (!tagPrefixes?.length) return;

		if (event.key === ' ' || event.key === 'Enter') {
			const trimmed = draft.trim();
			if (isSearchTag(trimmed, tagPrefixes)) {
				event.preventDefault();
				const nextTags = tags.includes(trimmed) ? tags : [...tags, trimmed];
				emit(nextTags, '');
			}
			return;
		}

		if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
			event.preventDefault();
			const lastTag = tags[tags.length - 1];
			emit(tags.slice(0, -1), lastTag);
		}
	};

	const handleBlur = () => {
		if (tagPrefixes?.length) {
			const parsed = deserializeSearchTags(serializeSearchTags(tags, draft), tagPrefixes);
			emit(parsed.tags, parsed.draft);
		}
		setFocused(false);
	};

	const handleRemoveTag = (tag: string) => {
		emit(tags.filter(item => item !== tag), draft);
	};

	const showClear = hasTags ? tags.length > 0 || draft.length > 0 : Boolean(value?.length);

	//
	// D. Render components

	if (!hasTags) {
		return (
			<MantineTextInput
				leftSection={<IconSearch size={iconSize} />}
				onChange={handleChange}
				placeholder={resolvedPlaceholder}
				rightSection={showClear && <Input.ClearButton onClick={handleClear} />}
				size={size}
				value={value ?? ''}
				w="100%"
			/>
		);
	}

	return (
		<PillsInput
			leftSection={<IconSearch size={iconSize} />}
			rightSection={showClear ? <Input.ClearButton onClick={handleClear} /> : undefined}
			size={size}
			w="100%"
		>
			<Pill.Group>
				{tags.map(tag => (
					<Pill key={tag} onRemove={() => handleRemoveTag(tag)} withRemoveButton>
						{formatTagLabel(tag)}
					</Pill>
				))}
				<PillsInput.Field
					onBlur={handleBlur}
					onChange={handleDraftChange}
					onFocus={() => setFocused(true)}
					onKeyDown={handleKeyDown}
					placeholder={tags.length ? undefined : resolvedPlaceholder}
					value={draft}
				/>
			</Pill.Group>
		</PillsInput>
	);

	//
}
