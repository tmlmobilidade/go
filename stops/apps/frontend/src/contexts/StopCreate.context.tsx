'use client';

/* * */

import { CREATE_STOP_MODAL_ID } from '@/components/Stops/Detail/CreateStopModal/CreateStopName';
import { Routes } from '@/lib/routes';
import { StopOptions } from '@/schemas/options';
import { type WorkerMessage } from '@/types/worker';
import { getAppConfig, Permissions } from '@tmlmobilidade/lib';
import { CreateStopDto, CreateStopSchema, Location, Stop, StopPermission, UpdateStopSchema } from '@tmlmobilidade/types';
import {
	closeModal,
	FormValidateInput,
	useForm,
	UseFormReturnType,
	useMeContext,
	useToast,
	zodResolver,
} from '@tmlmobilidade/ui';
import { convertObject, fetchData } from '@tmlmobilidade/utils';
import { generateRandomNumber } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';
import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { mutate } from 'swr';

/* * */

const initialNewStopState = {
	district: '',
	latitude: null,
	longitude: null,
	municipality: '',
	name: '',
	parish: '',
	short_name: '',
	tts_name: '',
};

interface initialNewStopStateProps {
	district: string
	latitude: number
	longitude: number
	municipality: string
	name: string
	parish: string
	short_name: string
	tts_name: string
}

const emptyStop: CreateStopDto = {
	_id: '',
	bench_status: 'unknown',
	comments: [],
	connections: [],
	district_id: '',
	electricity_status: 'unknown',
	equipment: [],
	facilities: [],
	file_ids: [],
	has_bench: 'unknown',
	has_mupi: 'unknown',
	has_network_map: 'unknown',
	has_schedules: 'unknown',
	has_shelter: 'unknown',
	has_stop_sign: 'unknown',
	image_ids: [],
	is_archived: false,
	is_locked: false,
	jurisdiction: 'unknown',
	last_infrastructure_check: undefined,
	last_infrastructure_maintenance: undefined,
	last_schedules_check: undefined,
	last_schedules_maintenance: undefined,
	latitude: 0,
	legacy_id: '',
	locality_id: '',
	longitude: 0,
	municipality_id: '',
	name: '',
	new_name: '',
	operational_status: 'voided',
	parish_id: '',
	pole_status: 'unknown',
	road_type: 'unknown',
	shelter_code: '',
	shelter_frame_size: undefined,
	shelter_installation_date: undefined,
	shelter_maintainer: '',
	shelter_make: undefined,
	shelter_model: undefined,
	shelter_status: 'unknown',
	short_name: '',
	tts_name: '',
};

interface StopCreateContextState {
	actions: {
		abbreviationsShortName: (name: string) => void
		closeCreateStopModalAndReset: () => void
		createStop: () => void
		createStopCoordinates: (latitude: number, longitude: number) => void
	}
	data: {
		form: UseFormReturnType<CreateStopDto>
		newStopState: initialNewStopStateProps
	}
	flags: {
		can_create: boolean
		error: Error | null
		loading: boolean
	}
}

/* * */

const StopCreateContext = createContext<StopCreateContextState | undefined>(undefined);

export function useStopCreateContext() {
	const context = useContext(StopCreateContext);
	if (!context) {
		throw new Error('useStopCreateContext must be used within a StopCreateContextProvider');
	}
	return context;
}

/* * */

export const StopCreateContextProvider = ({ children }: PropsWithChildren) => {
	const router = useRouter();
	const workerRef = useRef<null | Worker>(null);
	const meContext = useMeContext();

	const [isLoading, setIsLoading] = useState(false);
	const [canCreate, setCanCreate] = useState(false);
	const [stopError, setStopError] = useState<Error | null>(null);

	// 1. Load newStopState from localStorage
	const [newStopState, setNewStopState] = useState<initialNewStopStateProps>(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('newStopState');
			if (stored) {
				try {
					return JSON.parse(stored);
				}
				catch {
					return initialNewStopState;
				}
			}
		}
		return initialNewStopState;
	});

	// 2. Persist newStopState to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('newStopState', JSON.stringify(newStopState));
		}
	}, [newStopState]);

	// 3. Load form values from localStorage
	const storedFormValues = useMemo(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('createStopFormValues');
			if (saved) {
				try {
					return JSON.parse(saved);
				}
				catch {
					return emptyStop;
				}
			}
		}
		return emptyStop;
	}, []);

	const validationSchema = useMemo(
		() => zodResolver(CreateStopSchema) as unknown as FormValidateInput<CreateStopDto>,
		[],
	);

	const form = useForm<CreateStopDto>({
		initialValues: storedFormValues,
		validate: validationSchema,
		validateInputOnBlur: true,
		validateInputOnChange: true,
	});

	// 4. Persist form values to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('createStopFormValues', JSON.stringify(form.values));
		}
	}, [form.values]);

	// 5. Check if all required fields are filled
	useEffect(() => {
		const allFieldsFilled = Object.values(newStopState).every((value) => {
			if (typeof value === 'string') {
				return value.trim() !== '';
			}
			if (typeof value === 'number') {
				return !isNaN(value);
			}
			return value !== null && value !== undefined;
		});
		setCanCreate(allFieldsFilled && !stopError);
		console.log('form --> ', form.values);
	}, [newStopState, stopError]);

	// 6. Worker handling
	const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
		if (event.data.error) {
			useToast.error({ message: event.data.error.message, title: 'Erro ao criar Paragem' });
			return;
		}

		form.setValues({
			latitude: event.data.stop.stop_lat,
			longitude: event.data.stop.stop_lon,
			name: event.data.stop.stop_name,
		});

		const hasPermission = meContext.actions.hasPermissionResource<StopPermission>({
			action: Permissions.stops.actions.create,
			resource_key: 'agency_ids',
			scope: Permissions.stops.scope,
			value: event.data.stop,
		});

		if (!hasPermission) {
			setCanCreate(false);
			setStopError({
				message: 'Não é permitido criar uma paragem.',
				name: 'StopError',
			});
			return;
		}

		setCanCreate(true);
	};

	useEffect(() => {
		if (stopError) {
			setCanCreate(false);
			form.reset();
			return;
		}

		if (workerRef.current) {
			workerRef.current.terminate();
		}

		const worker = new Worker(new URL('@/types/worker.ts', import.meta.url));
		workerRef.current = worker;

		workerRef.current.onmessage = handleWorkerMessage;

		return () => {
			if (workerRef.current) {
				workerRef.current.terminate();
				workerRef.current = null;
			}
		};
	}, [stopError]);

	// 7. Stop creation logic
	const createStop = async (_id: string) => {
		setIsLoading(true);

		const allStops = await fetchData<Stop[]>(Routes.ME);
		const existingIds = allStops?.data?.map(stop => stop._id) || [];

		do {
			_id = String(696969);
		} while (existingIds.includes(_id));

		const saveStop: CreateStopDto = {
			...form.values,
			_id: _id,
		};

		const method = 'POST';
		const url = Routes.STOPS_DETAIL(saveStop._id);
		const body = convertObject(saveStop, UpdateStopSchema);

		const response = await fetchData<Stop>(url, method, body);

		console.log(response);

		if (response.error || !response.data?._id) {
			useToast.error({ message: response.error, title: 'Erro ao iniciar Validação' });
			setIsLoading(false);
			return;
		}

		router.push(`/stops/${response.data._id}`);

		useToast.success({
			message: 'Paragem criada com sucesso.',
			title: 'Sucesso',
		});

		localStorage.removeItem('newStopState');
		localStorage.removeItem('createStopFormValues');

		setIsLoading(false);
		closeModal(CREATE_STOP_MODAL_ID);
		mutate(`/api/stops/${saveStop._id}`);
	};

	// 8. Set coordinates and reverse-geocode location
	const setNewStopAndLocation = useCallback(async (latitude: number, longitude: number, district_id: string, municipality_id: string, parish_id: string) => {
		setNewStopState(prev => ({
			...prev,
			latitude,
			longitude,
		}));

		form.setValues({
			latitude,
			longitude,
		});

		try {
			const location = await fetchData<Location>(
				`${getAppConfig('locations', 'frontend_url', 'production')}/api/locations/coordinates?lon=${longitude}&lat=${latitude}`,
			);

			if (!location?.data) return;

			district_id = location.data.district._id;
			municipality_id = location.data.municipality._id;
			parish_id = location.data.parish._id;

			setNewStopState(prev => ({
				...prev,
				district: location.data.district.name,
				municipality: location.data.municipality.name,
				parish: location.data.parish.name,
			}));

			form.setValues({
				district_id,
				municipality_id,
				parish_id,
			});
		}
		catch (error) {
			console.error('Error:', error);
		}
	}, []);

	// 9. Set stop name with abbreviations
	const setNewStopName = useCallback((name: string) => {
		const parsedStopName = name.replace(/\s\s+/g, ' ');
		let shortenedStopName = parsedStopName;

		StopOptions.name_abbreviations
			.filter(abbreviation => abbreviation.enabled)
			.forEach((abbreviation) => {
				shortenedStopName = shortenedStopName.replace(abbreviation.phrase, abbreviation.replacement);
			});

		setNewStopState(prev => ({
			...prev,
			name: parsedStopName,
			short_name: shortenedStopName,
			tts_name: parsedStopName,
		}));

		form.setValues({
			name,
			short_name: shortenedStopName,
			tts_name: name,
		});
	}, []);

	// 10. Close modal and reset all data + clear localStorage
	const closeCreateStopModalAndReset = () => {
		closeModal(CREATE_STOP_MODAL_ID);
		setNewStopState(initialNewStopState);
		localStorage.removeItem('newStopState');
		localStorage.removeItem('createStopFormValues');
		form.reset();
	};

	// 11. Memoize context value
	// @ts-expect-error - stupid error because types
	const contextValue: StopCreateContextState = useMemo(() => {
		return {
			actions: {
				abbreviationsShortName: setNewStopName,
				closeCreateStopModalAndReset,
				createStop,
				createStopCoordinates: setNewStopAndLocation,
			},
			data: {
				form,
				newStopState,
			},
			flags: {
				can_create: canCreate,
				error: stopError,
				loading: isLoading,
			},
		};
	}, [form, isLoading, canCreate, stopError, newStopState]);

	return (
		<StopCreateContext.Provider value={contextValue}>
			{children}
		</StopCreateContext.Provider>
	);
};
