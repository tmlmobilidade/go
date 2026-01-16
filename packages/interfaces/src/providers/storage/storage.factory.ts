/* * */

import { OCIStorageProvider, OCIStorageProviderConfiguration } from '@/providers/storage/oci-storage.js';
import { IStorageProvider } from '@/providers/storage/storage.interface.js';

/* * */

export interface StorageConfiguration {
	oci_config: OCIStorageProviderConfiguration
	type: 'oci'
}

/* * */

export class StorageFactory {
	/**
     * Creates and returns an instance of a storage service based on the provided configuration.
     *
     * @param config - The storage configuration object.
     * @returns An instance of a class that implements IStorageProvider.
     */
	public static create(config: StorageConfiguration): IStorageProvider {
		switch (config.type) {
			case 'oci':
				return new OCIStorageProvider(config.oci_config);
			default:
				throw new Error(`Invalid storage type`);
		}
	}
}
