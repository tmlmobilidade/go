package transfers_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: to_stop_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies a stop (location_type=0) or a station (location_type=1) where a connection between routes ends.
If this field refers to a station, the transfer rule applies to all its child stops. It must refer to a stop (location_type=0) if transfer_type is 4 or 5.

Conditionally Required:
- Required if transfer_type is 1, 2, or 3.
- Optional if transfer_type is 4 or 5.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func ToStopIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "transfer_to_stop_id_references_stops_table"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("to_stop_id", "transfers.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the to_stop_id, transfer_type, from_stop_id values

	fields, err := db.Transfers.Fields("to_stop_id", "transfer_type", "from_stop_id")
	if err != nil {
		return err
	}

	//
	// 4. Get the to_stop_id value

	value := fields["to_stop_id"]

	//
	// 5. Skip empty to_stop_id values

	if value == "" {
		return nil
	}

	//
	// 6. Check if the to_stop_id reference exists

	if !db.Stops.Exists("stop_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}

	//
	// 7. Get the stops table

	stops, err := db.Table("stops")
	if err != nil {
		return err
	}
	seen := false

	//
	// 8. Check the matching stops and their access restrictions

	err = stops.ForEachMatching("stop_id", value, func(row *services.SQLiteRow) error {
		if seen {
			return nil
		}
		seen = true
		location, err := row.Field("location_type")
		if err != nil {
			return err
		}
		locationType := 0
		if location != "" {
			locationType, err = strconv.Atoi(location)
			if err != nil {
				return nil
			}
		}
		if locationType != 0 && locationType != 1 {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_location_type", value, locationType))
			return nil
		}
		transferType, _ := strconv.Atoi(fields["transfer_type"])
		if (transferType == 4 || transferType == 5) && locationType != 0 {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("must_be_stop_for_transfer_type_4_5", value, transferType))
			return nil
		}
		if fields["from_stop_id"] != "" && fields["from_stop_id"] == value {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("must_be_different_from_from_stop_id", value, fields["from_stop_id"]))
		}
		return nil
	})
	if err != nil {
		return err
	}

	//
	// 9. Return success

	return nil
}
