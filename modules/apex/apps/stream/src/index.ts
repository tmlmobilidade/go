/* * */

import { processApexLocation } from '@/tasks/process-apex-location.js';
import { processApexOnBoardRefund } from '@/tasks/process-apex-on-board-refund.js';
import { processApexOnBoardSale } from '@/tasks/process-apex-on-board-sale.js';
import { processApexValidation } from '@/tasks/process-apex-validation.js';

/* * */

(async function init() {
	//

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbTicketing.SalesEntity.watch().on('change', processApexOnBoardSale);
	pcgidbTicketing.SalesEntity.watch().on('change', processApexOnBoardRefund);
	pcgidbValidations.LocationEntity.watch().on('change', processApexLocation);
	pcgidbValidations.ValidationEntity.watch().on('change', processApexValidation);

	//
})();
