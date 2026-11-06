package geo

import (
	"database/sql"
	"fmt"

	mathgeo "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/geo"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/geo"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

/*
* loadShape reads the coordinates and sequences for one shape from SQLite and
* prepares its geometry for distance checks. Rows with empty coordinates are
* skipped. Missing rows or no parsable coordinates produce nil geometry.
* A missing database connection or a query failure returns an error.
 */
func loadShape(db *sql.DB, shapeID string) (*types.ShapeChunkedData, error) {
	//

	//
	// 1. Require a database connection before reading shape rows.

	if db == nil {
		return nil, fmt.Errorf("geometry requires a database connection")
	}

	//
	// 2. Read only the coordinates and sequences belonging to the requested shape.

	table := &sqliteTypes.SQLiteTable{DB: db, Name: "shapes"}
	points := []types.ShapeCoordinatesValidation{}
	err := queries.ForEachMatchingFields(table, "shape_id", []any{shapeID}, []string{"shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {

		//
		// 3. Collect rows with both coordinates, retaining their source sequences.

		if fields["shape_pt_lat"] != "" && fields["shape_pt_lon"] != "" {
			points = append(points, types.ShapeCoordinatesValidation{ShapeId: shapeID, ShapePtLat: fields["shape_pt_lat"], ShapePtLon: fields["shape_pt_lon"], ShapePtSeq: fields["shape_pt_sequence"]})
		}
		return nil
	})

	//
	// 4. Return query errors before attempting to prepare the collected geometry.

	if err != nil {
		return nil, err
	}

	//
	// 5. Sort and resample the shape while preserving original vertices for reports.

	return mathgeo.BuildShapeChunkedData(points), nil
}
