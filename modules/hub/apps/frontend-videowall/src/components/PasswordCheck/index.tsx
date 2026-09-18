'use client';

/* * */

import { Button, PasswordInput, useLocalStorage } from '@tmlmobilidade/ui';
import { type FormEvent, type PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface PasswordCheckProps {
	id: string
	password: string
}

/* * */

export function PasswordCheck({ children, id, password }: PropsWithChildren<PasswordCheckProps>) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [isValidated, setIsValidated] = useLocalStorage<boolean | null>({ defaultValue: null, key: `password-validated-${id}` });

	const [inputValue, setInputValue] = useState<string>('');
	const [isError, setIsError] = useState<boolean>(false);

	//
	// B. Handle actions

	const handleValidate = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (inputValue !== password) {
			setIsError(true);
			setInputValue('');
			setIsValidated(false);
			return;
		}
		setIsError(false);
		setInputValue('');
		setIsValidated(true);
	};

	//
	// C. Render components

	if (isValidated === true) {
		return children;
	}

	return (
		<form className={styles.overlay} onSubmit={handleValidate}>
			<PasswordInput
				className={styles.passwordInput}
				error={isError ? t('default:PasswordCheck.error') : undefined}
				onChange={e => setInputValue(e.target.value)}
				placeholder={t('default:PasswordCheck.placeholder')}
				value={inputValue}
			/>
			<Button
				className={styles.validateButton}
				label={t('default:PasswordCheck.validate.label')}
				type="submit"
			/>
		</form>
	);

	//
}
