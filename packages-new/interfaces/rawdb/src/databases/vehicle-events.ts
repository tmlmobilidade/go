/* * */

import { MongoInterfaceTemplate } from '@/interface.template.js';
import { type Db, type MongoClient } from '@tmlmobilidade/go-clients-mongo';
import { type RawVehicleEvent, RawVehicleEventSchema } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export class VehicleEventsDatabase {
	//

	//
	// Collections
	public readonly esCrtmAisaFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly esCrtmLaVelozFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCcflFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCmStreamCore: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCmStreamLog: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCmSyncCore: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCmSyncLog: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlCpFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlFertagusFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlMlFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlMobiFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlTcbFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmlTtslFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmpUnirFetch: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmpUnirLabdbStream: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;
	public readonly ptTmpUnirLabdbSync: MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>;

	//
	private readonly database: Db;
	private readonly databaseName = 'vehicle-events';

	public constructor(instance: MongoClient) {
		// Create the database instance
		this.database = instance.db(this.databaseName);

		// Create collection interfaces
		this.esCrtmAisaFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('es-crtm-aisa-fetch', this.database, RawVehicleEventSchema);
		this.esCrtmLaVelozFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('es-crtm-la-veloz-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlCcflFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-ccfl-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlCmStreamCore = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cm-stream-core', this.database, RawVehicleEventSchema);
		this.ptTmlCmStreamLog = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cm-stream-log', this.database, RawVehicleEventSchema);
		this.ptTmlCmSyncCore = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cm-sync-core', this.database, RawVehicleEventSchema);
		this.ptTmlCmSyncLog = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cm-sync-log', this.database, RawVehicleEventSchema);
		this.ptTmlCpFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-cp-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlFertagusFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-fertagus-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlMlFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-ml-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlMobiFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-mobi-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlTcbFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-tcb-fetch', this.database, RawVehicleEventSchema);
		this.ptTmlTtslFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tml-ttsl-fetch', this.database, RawVehicleEventSchema);
		this.ptTmpUnirFetch = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tmp-unir-fetch', this.database, RawVehicleEventSchema);
		this.ptTmpUnirLabdbStream = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tmp-unir-labdb-stream', this.database, RawVehicleEventSchema);
		this.ptTmpUnirLabdbSync = new MongoInterfaceTemplate<RawVehicleEvent, RawVehicleEvent>('pt-tmp-unir-labdb-sync', this.database, RawVehicleEventSchema);
	}
}
