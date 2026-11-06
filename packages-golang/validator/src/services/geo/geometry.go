package geo

import types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"

// Geometry owns caches for one validation invocation. Each rule creates its own instance.
type Geometry struct {
	shapes map[string]*types.ShapeChunkedData
	pairs  map[[2]string]*types.StopClosestShapePointsInfo
}
