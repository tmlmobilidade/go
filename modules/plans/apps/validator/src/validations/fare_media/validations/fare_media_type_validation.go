package fare_media

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
	"strconv"
)

/*
# Attributes

  - File: [fare_media.txt]
  - Field: fare_media_type
  - Presence: required
  - Type: enum

# Description

The type of fare media. Valid options are:

	0 - None. Used when there is no fare media involved in purchasing or validating a fare product, such as paying cash to a driver or conductor with no physical ticket provided.
	1 - Physical paper ticket that allows a passenger to take either a certain number of pre-purchased trips or unlimited trips within a fixed period of time.
	2 - Physical transit card that has stored tickets, passes or monetary value.
	3 - cEMV (contactless Europay, Mastercard and Visa) as an open-loop token container for account-based ticketing.
	4 - Mobile app that have stored virtual transit cards, tickets, passes, or monetary value.

[fare_media.txt]: https://gtfs.org/schedule/reference/#fare_mediatxt
*/

func FareMediaTypeValidation(fareMedia *types.FareMedia, row int, gtfs *types.Gtfs, rules *types.FareMediaRules) {
	ctx := lib.NewValidationContext("fare_media_type", "fare_media.txt", "fare_media_type_valid", row, services.AppMessageService)
	if rules != nil && rules.FareMediaType.Severity != "" {
		ctx.WithSeverity(rules.FareMediaType.Severity)
	}

	// Validate presence
	if fareMedia.FareMediaType == nil || strconv.Itoa(*fareMedia.FareMediaType) == "" {
		ctx.AddError(ctx.GetTranslatedMessage("fare_media_type_validation.required"))
		return
	}

	validTypeOptions := []int{0, 1, 2, 3, 4}
	// Validate that fareMedia.FareMediaType is in the valid options
	if !slices.Contains(validTypeOptions, *fareMedia.FareMediaType) {
		ctx.AddError(ctx.GetTranslatedMessage("fare_media_type_validation.invalid", fareMedia.FareMediaType))
		return
	}

	// Validate Rule Options
	if rules != nil && rules.FareMediaType.Options != nil {
		if slices.Contains(*rules.FareMediaType.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.FareMediaType.Options, strconv.Itoa(*fareMedia.FareMediaType)) {
			ctx.AddError(ctx.GetTranslatedMessage("fare_media_type_validation.not_allowed", fareMedia.FareMediaType))
			return
		}
	}
}
