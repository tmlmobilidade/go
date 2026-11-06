package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
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
func TransfersField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_attributes", []string{"transfers"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the transfers value

		value, err := queries.Field(row.Source, "transfers")
		if err != nil {
			return err
		}

		//
		// 3. Check if the transfers is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}
			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
