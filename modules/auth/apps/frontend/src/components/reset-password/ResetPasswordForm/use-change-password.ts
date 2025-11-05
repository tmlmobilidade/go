'use client';

import { Session } from '@go/types';
import { fetchData, HttpResponse } from '@go/utils';
import bcrypt from 'bcryptjs';
import { useState } from 'react';

interface UsechangePasswordReturn {
	changePassword: (password: string, token: string) => Promise<HttpResponse<Session>>
	loading: boolean
}

export function useChangePassword(): UsechangePasswordReturn {
	const [loading, setLoading] = useState<boolean>(false);

	const changePassword = async (password: string, token: string) => {
		setLoading(true);

		const password_hash = bcrypt.hashSync(password);

		const response = await fetchData<Session>(
			`/api/change-password`,
			'POST',
			{ password_hash, token },
		);

		setLoading(false);

		return response;
	};

	return { changePassword, loading };
}
