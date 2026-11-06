package geo

import (
	"database/sql"
	mathgeo "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/geo"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
)

// Distance caches both violations and successful checks, including missing geometry.
func (g *Geometry) Distance(db *sql.DB, stop types.StopCoordinatesValidation, shapeID string) (*types.StopClosestShapePointsInfo, error) {
	//
	// 1. Reuse results only within this service instance
	if g.shapes == nil {
		g.shapes = map[string]*types.ShapeChunkedData{}
	}
	if g.pairs == nil {
		g.pairs = map[[2]string]*types.StopClosestShapePointsInfo{}
	}
	key := [2]string{stop.StopId, shapeID}
	if result, found := g.pairs[key]; found {
		return result, nil
	}

	//
	// 2. Load and densify each referenced shape once
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
	// 3. Retain nil results so valid pairs do not trigger repeated geometry work
	result := mathgeo.StopShapeDistanceViolation(stop, shapeID, shape)
	g.pairs[key] = result
	return result, nil
}
