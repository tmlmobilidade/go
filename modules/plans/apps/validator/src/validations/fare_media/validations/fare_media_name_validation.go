package fare_media

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [fare_media.txt]
  - Field: fare_media_name
  - Presence: optional
  - Type: text

# Description

Name of the fare media.

For fare media which are transit cards (fare_media_type =2) or mobile apps (fare_media_type =4), the fare_media_name should be included and should match the rider-facing name used by the organizations delivering them.

[fare_media.txt]: https://gtfs.org/schedule/reference/#fare_mediatxt
*/

func FareMediaNameValidation(fareMedia *types.FareMedia, row int, gtfs *types.Gtfs, rules *types.FareMediaRules) {
	ctx := lib.NewValidationContext("fare_media_name", "fare_media.txt", "fare_media_name_non_empty", row, services.AppMessageService)
	if rules != nil && rules.FareMediaName.Severity != "" {
		ctx.WithSeverity(rules.FareMediaName.Severity)
	}

	if fareMedia.FareMediaName != nil && ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("fare_media_name_validation.forbidden"))
		return
	}

	if fareMedia.FareMediaName == nil {
		if fareMedia.FareMediaType != nil && (*fareMedia.FareMediaType == 2 || *fareMedia.FareMediaType == 4) {
			ctx.AddWarning(ctx.GetTranslatedMessage("fare_media_name_validation.warning"))
			return
		}

		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("fare_media_name_validation.required", "fare_media_name_validation.recommended")
		ctx.AddMessageWithSeverity(message)
	}
}
