package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

/*
# Attributes

- File: [pathways.txt]
- Field: to_stop_id
- Presence: Required
- Type: Foreign ID referencing [stops.stop_id]

# Description

Identifies the stop where the pathway ends.

Must contain a stop_id that identifies a platform (location_type=0 or empty), entrance/exit (location_type=2), generic node (location_type=3) or boarding area (location_type=4).

Values for stop_id that identify stations (location_type=1), or stops (location_type=0 or empty) with stop_access=1, are forbidden.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
[stops.stop_id]: https://gtfs.org/schedule/reference/#stopstxt
*/
func PathwaysToStopIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_to_stop_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("to_stop_id", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the to_stop_id value

	value, err := db.Pathways.Field("to_stop_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty to_stop_id values

	if value == "" {
		return nil
	}

	//
	// 5. Get the stops table

	table, err := db.Table("stops")
	if err != nil {
		return err
	}
	found := false

	//
	// 6. Check the matching stops and their access restrictions

	err = table.ForEachMatching("stop_id", value, func(row *services.SQLiteRow) error {
		if found {
			return nil
		}
		found = true
		values, err := row.Fields("location_type", "stop_access")
		if err != nil {
			return err
		}
		locationType := 0
		if values["location_type"] != "" {
			locationType, err = strconv.Atoi(values["location_type"])
			if err != nil { // Stop format is validated by the stops checks.
				return nil
			}
		}
		if locationType == 1 {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_location_type_station", value))
			return nil
		}
		if locationType != 0 && locationType != 2 && locationType != 3 && locationType != 4 {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_location_type_pathway", value, locationType))
			return nil
		}
		if locationType == 0 {
			access := 0
			if values["stop_access"] != "" {
				access, err = strconv.Atoi(values["stop_access"])
				if err != nil { // Stop format is validated by the stops checks.
					return nil
				}
			}
			if access == 1 {
				ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden_stop_access_1", value))
			}
		}
		return nil
	})
	if err != nil {
		return err
	}

	//
	// 7. Report a missing to_stop_id reference

	if !found {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}

	//
	// 8. Return success

	return nil
}
