'use client';

import { Session } from '@tmlmobilidade/types';
import { fetchData, HttpResponse } from '@tmlmobilidade/utils';
import { useState } from 'react';

interface UsechangePasswordReturn {
	changePassword: (password_hash: string, token: string) => Promise<HttpResponse<Session>>
	loading: boolean
}

export function useChangePassword(): UsechangePasswordReturn {
	const [loading, setLoading] = useState<boolean>(false);

	const changePassword = async (password_hash: string, token: string) => {
		setLoading(true);
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
