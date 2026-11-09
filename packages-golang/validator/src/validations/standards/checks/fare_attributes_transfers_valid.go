package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes
  - File: [fare_attributes.txt]
  - Field: transfers
  - Presence: Required
  - Type: Enum

# Description

Indicates the number of transfers permitted on this fare. Valid options are:

  - 0 - No transfers permitted on this fare.
  - 1 - Riders may transfer once.
  - 2 - Riders may transfer twice.
  - empty - Unlimited transfers are permitted.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
*/
func TransfersValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "fare_attributes", []string{"transfers"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "transfers")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Convert the transfers value to a number

		number, parseErr := strconv.Atoi(value)
		if parseErr != nil || number < 0 || number > 2 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 3. Return success

		return nil
	})
}
