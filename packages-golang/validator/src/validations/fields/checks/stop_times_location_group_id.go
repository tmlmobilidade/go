package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: location_group_id
  - Presence: Conditionally Forbidden
  - Type: Foreign ID referencing location_groups.location_group_id

# Description

Identifies a group of stops at which riders can request pickup or drop-off. Every serviced group must appear in
stop_times.txt, ordered by the sequence in which service is available.

Conditionally Forbidden:
- Forbidden if `stop_times.stop_id` or `stop_times.location_id` are defined.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func LocationGroupIdField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"location_group_id"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the location_group_id value

		value, err := queries.Field(row.Source, "location_group_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if stop_id or location_id is defined

		for _, field := range []string{"stop_id", "location_id"} {
			exists, err := queries.Exists(row.Source.Table, field, value)
			if err != nil {
				return err
			}
			if exists {
				context.AddMessage(row, context.GetTranslatedMessage(row, "forbidden_stop_location"))
				return nil
			}
		}

		//
		// 4. Return success

		return nil
	})
}
