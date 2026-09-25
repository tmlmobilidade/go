package stops

import (
	"main/lib"
	"main/services"
	"main/types"
)

// ParseStop parses a row from stops.txt into a Stop struct, following gtfs-parser-validation best practices
func ParseStop(rawStop types.StopRaw, row int) types.Stop {
	var (
		stop                                                                                                                                                                                                                  types.Stop = types.Stop{}
		stopId, stopCode, stopName, stopDesc, zoneId, stopUrl, parentStation, stopTimezone, levelId, platformCode, ttsStopName, shelterCode, shelterMaintainer, stopShortName, municipalityId, parishId, regionId             string
		locationType, wheelchairBoarding, hasBench, hasNetworkMap, hasPipRealTime, hasSchedules, hasShelter, hasStopSign, hasTariffsInformation, publicVisible, stopAccess                                                     int
		stopLat, stopLon                                                                                                                                                                                                      float64
		messages                                                                                                                                                                                                              []types.Message
	)

	stringFields := map[string]*string{
		"stop_id":            &stopId,
		"stop_code":          &stopCode,
		"stop_name":          &stopName,
		"stop_desc":          &stopDesc,
		"zone_id":            &zoneId,
		"stop_url":           &stopUrl,
		"parent_station":     &parentStation,
		"stop_timezone":      &stopTimezone,
		"level_id":           &levelId,
		"platform_code":      &platformCode,
		"tts_stop_name":      &ttsStopName,
		"shelter_code":       &shelterCode,
		"shelter_maintainer": &shelterMaintainer,
		"stop_short_name":    &stopShortName,
		"municipality_id":    &municipalityId,
		"parish_id":          &parishId,
		"region_id":          &regionId,
	}

	intFields := map[string]*int{
		"location_type":           &locationType,
		"wheelchair_boarding":     &wheelchairBoarding,
		"has_bench":               &hasBench,
		"has_network_map":         &hasNetworkMap,
		"has_pip_real_time":       &hasPipRealTime,
		"has_schedules":           &hasSchedules,
		"has_shelter":             &hasShelter,
		"has_stop_sign":           &hasStopSign,
		"has_tariffs_information": &hasTariffsInformation,
		"public_visible":          &publicVisible,
		"stop_access":             &stopAccess,
	}

	float64Fields := map[string]*float64{
		"stop_lat": &stopLat,
		"stop_lon": &stopLon,
	}

	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "stops.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "stops_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawStop, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}
	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawStop, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}
	// Parse float32 fields
	for field, target := range float64Fields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawStop, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return stop
	}

	// Assign fields
	stop.HasBench = lib.IfThenElse(rawStop.HasBench != "", &hasBench, nil)
	stop.HasNetworkMap = lib.IfThenElse(rawStop.HasNetworkMap != "", &hasNetworkMap, nil)
	stop.HasPipRealTime = lib.IfThenElse(rawStop.HasPipRealTime != "", &hasPipRealTime, nil)
	stop.HasSchedules = lib.IfThenElse(rawStop.HasSchedules != "", &hasSchedules, nil)
	stop.HasShelter = lib.IfThenElse(rawStop.HasShelter != "", &hasShelter, nil)
	stop.HasStopSign = lib.IfThenElse(rawStop.HasStopSign != "", &hasStopSign, nil)
	stop.HasTariffsInformation = lib.IfThenElse(rawStop.HasTariffsInformation != "", &hasTariffsInformation, nil)
	stop.LevelId = lib.IfThenElse(rawStop.LevelId != "", &levelId, nil)
	stop.LocationType = lib.IfThenElse(rawStop.LocationType != "", &locationType, nil)
	stop.MunicipalityId = lib.IfThenElse(rawStop.MunicipalityId != "", &municipalityId, nil)
	stop.ParentStation = lib.IfThenElse(rawStop.ParentStation != "", &parentStation, nil)
	stop.ParishId = lib.IfThenElse(rawStop.ParishId != "", &parishId, nil)
	stop.PlatformCode = lib.IfThenElse(rawStop.PlatformCode != "", &platformCode, nil)
	stop.PublicVisible = lib.IfThenElse(rawStop.PublicVisible != "", &publicVisible, nil)
	stop.RegionId = lib.IfThenElse(rawStop.RegionId != "", &regionId, nil)
	stop.ShelterCode = lib.IfThenElse(rawStop.ShelterCode != "", &shelterCode, nil)
	stop.ShelterMaintainer = lib.IfThenElse(rawStop.ShelterMaintainer != "", &shelterMaintainer, nil)
	stop.StopCode = lib.IfThenElse(rawStop.StopCode != "", &stopCode, nil)
	stop.StopDesc = lib.IfThenElse(rawStop.StopDesc != "", &stopDesc, nil)
	stop.StopId = lib.IfThenElse(rawStop.StopId != "", &stopId, nil)
	stop.StopLat = lib.IfThenElse(rawStop.StopLat != "", &stopLat, nil)
	stop.StopLon = lib.IfThenElse(rawStop.StopLon != "", &stopLon, nil)
	stop.StopName = lib.IfThenElse(rawStop.StopName != "", &stopName, nil)
	stop.StopShortName = lib.IfThenElse(rawStop.StopShortName != "", &stopShortName, nil)
	stop.StopTimezone = lib.IfThenElse(rawStop.StopTimezone != "", &stopTimezone, nil)
	stop.StopUrl = lib.IfThenElse(rawStop.StopUrl != "", &stopUrl, nil)
	stop.TtsStopName = lib.IfThenElse(rawStop.TtsStopName != "", &ttsStopName, nil)
	stop.WheelchairBoarding = lib.IfThenElse(rawStop.WheelchairBoarding != "", &wheelchairBoarding, nil)
	stop.ZoneId = lib.IfThenElse(rawStop.ZoneId != "", &zoneId, nil)
	stop.StopAccess = lib.IfThenElse(rawStop.StopAccess != "", &stopAccess, nil)
	return stop
}
