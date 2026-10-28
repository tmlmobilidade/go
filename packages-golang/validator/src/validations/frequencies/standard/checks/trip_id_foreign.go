package frequencies_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: trip_id
  - Presence: Required
  - Type: Foreign Key referencing trips.trip_id

# Description

Identifies a trip to which the specified headway of service applies.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func TripIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "frequencies_trip_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("trip_id", "frequencies.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the trip_id value

	value, err := db.Frequencies.Field("trip_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty trip_id values

	if value == "" {
		return nil
	}

	//
	// 5. Get the trips table

	table, err := db.Table("trips")
	if err != nil {
		return err
	}

	//
	// 6. Check if the trip_id reference exists

	exists, err := table.Exists("trip_id", value)
	if err != nil {
		return err
	}

	//
	// 7. Report a missing trip_id reference

	if !exists {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}

	//
	// 8. Return success

	return nil
}
