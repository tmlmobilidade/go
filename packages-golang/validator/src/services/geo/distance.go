package geo

import (
	"database/sql"

	mathgeo "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/geo"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/geo"
)

/*
* Distance checks a stop against a shape and caches the result for this instance.
* Cached nil results include successful checks and unavailable geometry.
* Load errors are returned without caching the failed lookup.
 */
func (g *Geometry) Distance(db *sql.DB, stop types.StopCoordinatesValidation, shapeID string) (*types.StopClosestShapePointsInfo, error) {
	//

	//
	// 1. Initialize the shape and stop-shape caches for this service instance.

	if g.shapes == nil {
		g.shapes = map[string]*types.ShapeChunkedData{}
	}
	if g.pairs == nil {
		g.pairs = map[[2]string]*types.StopClosestShapePointsInfo{}
	}

	//
	// 2. Reuse a cached result for this stop ID and shape ID, including nil results.

	key := [2]string{stop.StopId, shapeID}
	if result, found := g.pairs[key]; found {
		return result, nil
	}

	//
	// 3. Load and prepare each referenced shape once for distance checks.

	shape, found := g.shapes[shapeID]
	if !found {
		var err error
		shape, err = loadShape(db, shapeID)
		if err != nil {
			return nil, err
		}
		g.shapes[shapeID] = shape
	}

	//
	// 4. Cache the finding or nil result so this pair needs no repeated calculation.

	result := mathgeo.StopShapeDistanceViolation(stop, shapeID, shape)
	g.pairs[key] = result
	return result, nil
}
