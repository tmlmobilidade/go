'use client';

/* * */

import { IconSend } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import styles from './styles.module.css';

import { isPlatformMac } from '../../../utils';
import { IconButton } from '../../buttons';
import { Label } from '../../display/Label';
import { Textarea } from '../../inputs';
import { Section } from '../../layout/Section';

/* * */

export interface CommentInputProps {
	/**
	 * Disable the input and actions.
	 */
	disabled?: boolean

	/**
	 * Display an error message below the field.
	 */
	error?: string

	/**
	 * Loading state for the send action.
	 */
	loading?: boolean

	/**
	 * Optional maximum characters allowed. Displays a counter and prevents send when exceeded.
	 */
	maxChars?: number

	/**
	 * Called when the comment is submitted.
	 */
	onSubmit: (comment: string) => void

	/**
	 * Placeholder for the textarea.
	 */
	placeholder?: string
}

/* * */

export function CommentInput({
	disabled,
	error,
	loading,
	maxChars = 300,
	onSubmit,
	placeholder = 'Deixa um comentário...',
}: CommentInputProps) {
	//
	// A. State
	const [isFocused, setIsFocused] = useState(false);
	const [value, setValue] = useState('');

	//
	// B. Derived state
	const charCount = value.length;
	const isOverLimit = maxChars ? charCount > maxChars : false;
	const isSendDisabled = disabled || !!error || charCount === 0 || isOverLimit;

	//
	// C. Handlers
	const handleFocus = useCallback(() => setIsFocused(true), []);
	const handleBlur = useCallback(() => setIsFocused(false), []);

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement>) => {
			setValue(event.currentTarget.value);
		},
		[],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			// Cmd+Enter (Mac) or Ctrl+Enter (others) to submit
			if (event.key === 'Enter' && (isPlatformMac() ? event.metaKey : event.ctrlKey)) {
				event.preventDefault();
				handleSubmit();
			}

			// Escape to blur
			if (event.key === 'Escape') {
				event.preventDefault();
				(event.currentTarget as HTMLTextAreaElement).blur();
			}
		},
		[value, disabled, error],
	);

	const handleSubmit = useCallback(() => {
		if (isSendDisabled || loading) return;
		onSubmit(value.trim());
		setValue('');
	}, [isSendDisabled, loading, onSubmit, value]);

	//
	// D. Render
	return (
		<div className={styles.root}>
			<div
				className={styles.container}
				data-disabled={disabled || undefined}
				data-error={error ? true : undefined}
				data-focused={isFocused || undefined}
				onClick={handleFocus}
			>
				<Section flexDirection="column" gap="xs" padding="none">
					<Textarea
						disabled={disabled}
						maxRows={5}
						onBlur={handleBlur}
						onChange={handleChange}
						onFocus={handleFocus}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						value={value}
						w="100%"
					/>
					{maxChars && (
						<Label size="sm" variant={isFocused && isOverLimit ? 'danger' : undefined}>
							{charCount} / {maxChars}
						</Label>
					)}
				</Section>

				<IconButton
					disabled={isSendDisabled}
					icon={<IconSend size={20} />}
					isLoading={loading}
					onClick={handleSubmit}
				/>
			</div>

			{error && <div className={styles.error}>{error}</div>}
		</div>
	);
}
