'use client';

/* * */

import { Button, PasswordInput } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { type FormEvent, type PropsWithChildren, useState } from 'react';

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
				error={isError ? 'Invalid password' : undefined}
				onChange={e => setInputValue(e.target.value)}
				placeholder="Introduza a sua password..."
				value={inputValue}
			/>

			<Button
				className={styles.validateButton}
				type="submit"
			>
				Validate
			</Button>

		</form>
	);

	//
}
