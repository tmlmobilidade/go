package fare_media

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [fare_media.txt]
  - Field: fare_media_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a fare media.

[fare_media.txt]: https://gtfs.org/schedule/reference/#fare_mediatxt
*/

func FareMediaIdValidation(fareMedia *types.FareMedia, row int, gtfs *types.Gtfs, rules *types.FareMediaRules) {
	ctx := lib.NewValidationContext("fare_media_id", "fare_media.txt", "fare_media_id_unique", row, services.AppMessageService)
	if rules != nil && rules.FareMediaId.Severity != "" {
		ctx.WithSeverity(rules.FareMediaId.Severity)
	}

	// 1. Validate fare_media_id is present
	if fareMedia.FareMediaId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("fare_media_id_validation.required", "fare_media_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate fare_media_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("fare_media_id_validation.forbidden"))
		return
	}

	// 3. Validate fare_media_id is unique
	rows, err := gtfs.GetRowsById("fare_media", *fareMedia.FareMediaId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("fare_media_id_validation.duplicate", map[string]interface{}{"fare_media_id": *fareMedia.FareMediaId}))
		return
	}
}
