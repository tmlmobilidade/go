package geo

import types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"

/*
* Geometry owns caches for one validation invocation. Each rule creates its own
* instance. Distance initializes the caches when they are first needed.
 */
type Geometry struct {
	//

	//
	// 1. Retain prepared geometry by shape ID, including unavailable geometry.

	shapes map[string]*types.ShapeChunkedData

	//
	// 2. Retain distance findings or nil results by stop ID and shape ID.

	pairs map[[2]string]*types.StopClosestShapePointsInfo
}
