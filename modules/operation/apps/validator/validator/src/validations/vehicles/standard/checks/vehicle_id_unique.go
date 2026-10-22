package vehicles_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: vehicle_id
  - Presence: Required
  - Type: unique ID

# Description

Uniquely identifies a vehicle within the operator's fleet.
It is used to track the vehicle as it circulates throughout the transport network.
Corresponds to the field in the GTFS-RT specification: FeedMessage › FeedEntity › VehiclePosition › Vehicle in real-time data—serving as the vehicle's internal identifier in the system.
*/
func VehicleIdUnique(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "vehicle_id_unique"
	ctx := lib.NewValidationContext("vehicle_id", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("vehicle_id")
	if err != nil {
		return err
	}
	// Presence belongs to the field check.
	if value == "" {
		return nil
	}
	_, count, err := db.Vehicles.FieldWithCount("vehicle_id")
	if err != nil {
		return err
	}
	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}
	return nil
}
