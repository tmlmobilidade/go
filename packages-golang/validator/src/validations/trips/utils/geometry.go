package trips_utils

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	shapes_coordinates "github.com/tmlmobilidade/go/packages-golang/validator/src/services/geo/shapes"
	stops_coordinates "github.com/tmlmobilidade/go/packages-golang/validator/src/services/geo/stops"
	"main/types"
)

// Geometry caches derived geometry within one validation run. Source trip and stop
// references are read from SQLite; only expensive shape and distance results are reused.
type Geometry struct {
	shapes map[string]*shapes_coordinates.ShapeChunkedData
	pairs  map[[2]string]*types.StopClosestShapePointsInfo
}

func (g *Geometry) Distance(db *services.SQLiteContext, stop types.StopCoordinatesValidation, shapeID string) (*types.StopClosestShapePointsInfo, error) {
	if g.shapes == nil {
		g.shapes = map[string]*shapes_coordinates.ShapeChunkedData{}
		g.pairs = map[[2]string]*types.StopClosestShapePointsInfo{}
	}
	key := [2]string{stop.StopId, shapeID}
	if result, ok := g.pairs[key]; ok {
		return result, nil
	}
	shape, ok := g.shapes[shapeID]
	if !ok {
		table, err := db.Table("shapes")
		if err != nil {
			return nil, err
		}
		points := []types.ShapeCoordinatesValidation{}
		err = table.ForEachMatchingFields("shape_id", shapeID, []string{"shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"}, func(_ *services.SQLiteRow, fields map[string]string) error {
			if fields["shape_pt_lat"] != "" && fields["shape_pt_lon"] != "" {
				points = append(points, types.ShapeCoordinatesValidation{ShapeId: shapeID, ShapePtLat: fields["shape_pt_lat"], ShapePtLon: fields["shape_pt_lon"], ShapePtSeq: fields["shape_pt_sequence"]})
			}
			return nil
		})
		if err != nil {
			return nil, err
		}
		shape = shapes_coordinates.BuildShapeChunkedData(points)
		g.shapes[shapeID] = shape
	}
	if shape == nil {
		g.pairs[key] = nil
		return nil, nil
	}
	result := stops_coordinates.StopShapeDistanceViolation(stop, shapeID, shape)
	g.pairs[key] = result
	return result, nil
}
