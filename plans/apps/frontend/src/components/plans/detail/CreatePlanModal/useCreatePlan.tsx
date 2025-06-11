import { Routes } from '@/lib/routes';
import { Plan, Validation } from '@tmlmobilidade/types';
import { closeModal, useToast } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { mutate } from 'swr';

export const CREATE_PLAN_MODAL_ID = 'create-plan-modal';

interface CreatePlanState {
	actions: {
		createPlan: () => void
		setSelectedValidation: (validation_id: string) => void
	}
	data: {
		selectedValidation: null | Validation
		validations: Validation[]
	}
	flags: {
		canCreatePlan: boolean
		loading: boolean
	}
}

export function useCreatePlan(validations: Validation[], validation_id?: string) {
	//

	//
	// A. Define state
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [selectedValidation, setSelectedValidation] = useState<null | Validation>(validation_id ? validations.find(v => v._id === validation_id) ?? null : null);

	//
	// B. Define actions
	const handleCreatePlan = async () => {
		setLoading(true);
		const response = await fetchData<Plan>(Routes.API(Routes.PLAN_LIST), 'POST', {
			validation_id: selectedValidation?._id,
		});

		if (response.error) {
			useToast.error({
				message: response.error,
				title: 'Erro ao criar validação',
			});
			setLoading(false);
			return;
		}

		if (response.data) {
			router.push(Routes.PLAN_DETAIL(response.data._id));
		}

		useToast.success({
			message: 'Validação criado com sucesso',
			title: 'Sucesso',
		});

		mutate(Routes.API(Routes.PLAN_LIST));

		setLoading(false);
		closeModal(CREATE_PLAN_MODAL_ID);
	};

	const handleSetSelectedValidation = (validation_id: string) => {
		setSelectedValidation(validations.find(v => v._id === validation_id) ?? null);
	};

	//
	// D. Define context value
	const contextValue: CreatePlanState = useMemo(() => {
		return {
			actions: {
				createPlan: handleCreatePlan,
				setSelectedValidation: handleSetSelectedValidation,
			},
			data: {
				selectedValidation,
				validations: validations.filter(v => v.feeder_status === 'success'),
			},
			flags: {
				canCreatePlan: selectedValidation !== null,
				loading,
			},
		};
	}, [selectedValidation, validations, loading]);

	return contextValue;
}
