'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { Session } from '@tmlmobilidade/types';
import { fetchData, HttpResponse } from '@tmlmobilidade/utils';
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
			API_ROUTES.auth.AUTH_CHANGE_PASSWORD,
			'POST',
			{ password_hash, token },
		);

		setLoading(false);

		return response;
	};

	return { changePassword, loading };
}
