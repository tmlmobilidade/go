package trips_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: shape_id
  - Presence: Required
  - Type: Foreign Key referencing shapes.shape_id

# Description

Identifies a geospatial shape describing the vehicle travel path for a trip.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func ShapeIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trips_shape_id_references_shapes_table_when_present"
	ctx := lib.NewValidationContext("shape_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Trips.Field("shape_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	if !db.Shapes.Exists("shape_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}
	return nil
}
