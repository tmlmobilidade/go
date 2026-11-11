package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: transfers
  - Presence: Required
  - Type: Enum

# Description

Number of transfers included in the fare: 0 for none, 1 for one, 2 for two or an empty value for unlimited
transfers.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func TransfersField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_attributes", []string{"transfers"}, func(row *contextTypes.ValidationContext) error {
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
