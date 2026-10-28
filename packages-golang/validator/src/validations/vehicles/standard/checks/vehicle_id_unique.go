package vehicles_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_vehicle_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("vehicle_id", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the vehicle_id value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("vehicle_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty vehicle_id values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Count matching vehicle_id values

	_, count, err := db.Vehicles.FieldWithCount("vehicle_id")
	if err != nil {
		return err
	}

	//
	// 6. Check if the vehicle_id is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 7. Return success

	return nil
}
