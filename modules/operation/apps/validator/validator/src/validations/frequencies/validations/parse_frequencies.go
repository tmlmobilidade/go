package frequencies

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseFrequencies(rawFrequencies *types.FrequenciesRaw, row int) *types.Frequencies {
	var (
		frequency                  types.Frequencies = types.Frequencies{}
		tripId, endTime, startTime string
		exactTimes                 int
		headwaySecs                int
		messages                   []types.Message
	)

	stringFields := map[string]*string{
		"trip_id":    &tripId,
		"end_time":   &endTime,
		"start_time": &startTime,
	}

	intFields := map[string]*int{
		"exact_times": &exactTimes,
	}

	floatFields := map[string]*int{
		"headway_secs": &headwaySecs,
	}

	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:        field,
			FileName:     "frequencies.txt",
			Rows:         []int{row},
			Message:      msg,
			Severity:     types.SEVERITY_ERROR,
			RuleID:       "frequencies_values_parse",
		})
	}

	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFrequencies, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	for field, target := range floatFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFrequencies, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFrequencies, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return &frequency
	}

	frequency.TripId = lib.IfThenElse(rawFrequencies.TripId != "", &tripId, nil)
	frequency.ExactTimes = lib.IfThenElse(rawFrequencies.ExactTimes != "", &exactTimes, nil)
	frequency.HeadwaySecs = lib.IfThenElse(rawFrequencies.HeadwaySecs != "", &headwaySecs, nil)
	frequency.StartTime = lib.IfThenElse(rawFrequencies.StartTime != "", &startTime, nil)
	frequency.EndTime = lib.IfThenElse(rawFrequencies.EndTime != "", &endTime, nil)

	return &frequency
}
