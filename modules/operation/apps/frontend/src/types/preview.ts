import { type CreateVehicleDto } from '@tmlmobilidade/go-types-operation';

export interface VehicleImportPreview {
	changes?: Partial<Record<keyof CreateVehicleDto, { newValue: unknown, oldValue: unknown }>>
	mode: 'CREATE' | 'UPDATE'
	vehicle: CreateVehicleDto
}
