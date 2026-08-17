package fare_attributes

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes
  - File: [fare_attributes.txt]
  - Field: transfers
  - Presence: Required
  - Type: Enum

# Description

Indicates the number of transfers permitted on this fare.

Indicates the number of transfers permitted on this fare. Valid options are:

  - 0 - No transfers permitted on this fare.
  - 1 - Riders may transfer once.
  - 2 - Riders may transfer twice.
  - empty - Unlimited transfers are permitted.

# Example

Suppose a route has one set of trips available on holidays and another set of trips available on all other days.

One service_id could correspond to the regular service schedule and another service_id could correspond to the holiday schedule.

For a particular holiday, the [calendar_dates.txt] file could be used to add the holiday to the holiday service_id and to remove the holiday from the regular service_id schedule.

[fare_attributes.txt]: https://gtfs.org/schedule/reference/#fare_attributestxt
[calendar_dates.txt]: https://gtfs.org/schedule/reference/#calendar_datestxt
*/
func TransfersValidation(fareAttribute *types.FareAttribute, row int, gtfs *types.Gtfs) {
	ctx := lib.NewValidationContext("transfers", "fare_attributes.txt", "transfers_valid_gtfs_enum", row, services.AppMessageService)

	// TODO: The header is required, but the content is optional.
	if fareAttribute.Transfers == nil {
		return
	}

	validTransfers := []int{0, 1, 2}
	if !slices.Contains(validTransfers, *fareAttribute.Transfers) {
		ctx.AddError(ctx.GetTranslatedMessage("transfers_validation.invalid", *fareAttribute.Transfers))
	}
}
