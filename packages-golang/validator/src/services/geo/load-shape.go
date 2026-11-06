package geo

import (
	"database/sql"
	"fmt"
	mathgeo "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// loadShape reads only the coordinates needed by the geometry calculation.
func loadShape(db *sql.DB, shapeID string) (*types.ShapeChunkedData, error) {
	if db == nil {
		return nil, fmt.Errorf("geometry requires a database connection")
	}
	table := &sqliteTypes.SQLiteTable{DB: db, Name: "shapes"}
	points := []types.ShapeCoordinatesValidation{}
	err := queries.ForEachMatchingFields(table, "shape_id", []any{shapeID}, []string{"shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
		if fields["shape_pt_lat"] != "" && fields["shape_pt_lon"] != "" {
			points = append(points, types.ShapeCoordinatesValidation{ShapeId: shapeID, ShapePtLat: fields["shape_pt_lat"], ShapePtLon: fields["shape_pt_lon"], ShapePtSeq: fields["shape_pt_sequence"]})
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return mathgeo.BuildShapeChunkedData(points), nil
}
