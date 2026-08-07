import { type Observability } from '@/utils/observability.js';
import { type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type OCIStorageClientWrapper } from '@tmlmobilidade/go-clients-oci-storage';

export interface StorageDeps {
	blobs: OCIStorageClientWrapper
	mongoClient: MongoClient
	observability: Observability
}
