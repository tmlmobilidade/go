package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes

  - File: frequencies.txt
  - Field: headway_secs
  - Presence: Required
  - Type: positive integer

# Description

Headway of service in seconds.

[frequencies.txt]: https://gtfs.org/schedule/reference/#frequenciestxt
*/
func HeadwaySecsValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "frequencies", []string{"headway_secs"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "headway_secs")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty headway_secs values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the headway_secs to an integer

		parsed, err := strconv.Atoi(value)

		//
		// 4. Check if the headway_secs is positive

		if err != nil || parsed <= 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 5. Return success

		return nil
	})
}
