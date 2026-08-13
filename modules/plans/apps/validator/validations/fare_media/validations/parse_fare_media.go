package fare_media

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseFareMedia(rawFareMedia types.FareMediaRaw, row int) types.FareMedia {
	var (
		fareMedia                  types.FareMedia = types.FareMedia{}
		fareMediaId, fareMediaName string
		fareMediaType              int
		messages                   []types.Message
	)

	stringFields := map[string]*string{
		"fare_media_id":   &fareMediaId,
		"fare_media_name": &fareMediaName,
	}

	intFields := map[string]*int{
		"fare_media_type": &fareMediaType,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "fare_media.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "fare_media_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFareMedia, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFareMedia, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return fareMedia
	}

	// Assign fields
	fareMedia.FareMediaId = lib.IfThenElse(rawFareMedia.FareMediaId != "", &fareMediaId, nil)
	fareMedia.FareMediaName = lib.IfThenElse(rawFareMedia.FareMediaName != "", &fareMediaName, nil)
	fareMedia.FareMediaType = lib.IfThenElse(rawFareMedia.FareMediaType != "", &fareMediaType, nil)

	return fareMedia
}
