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

	if fareMedia.FareMediaId == nil {
		ctx.AddError(ctx.GetTranslatedMessage("fare_media_id_validation.required"))
		return
	}

	rows, err := gtfs.GetRowsById("fare_media", *fareMedia.FareMediaId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("fare_media_id_validation.duplicate", map[string]interface{}{"fare_media_id": *fareMedia.FareMediaId}))
		return
	}
}
