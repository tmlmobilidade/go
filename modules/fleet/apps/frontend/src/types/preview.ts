import { CreateVehicleDto } from '@tmlmobilidade/types';

export interface VehicleImportPreview {
	changes?: Partial<Record<keyof CreateVehicleDto, { newValue: unknown, oldValue: unknown }>>
	mode: 'CREATE' | 'UPDATE'
	vehicle: CreateVehicleDto
}
