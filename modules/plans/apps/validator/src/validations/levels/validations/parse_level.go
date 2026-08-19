package levels

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseLevel(rawLevel types.LevelsRaw, row int) types.Levels {
	var (
		level              types.Levels = types.Levels{}
		levelId, levelName string
		levelIndex         float32
		messages           []types.Message
	)

	stringFields := map[string]*string{
		"level_id":   &levelId,
		"level_name": &levelName,
	}

	floatFields := map[string]*float32{
		"level_index": &levelIndex,
	}

	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "levels.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "levels_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawLevel, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range floatFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawLevel, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return level
	}

	level.LevelId = lib.IfThenElse(rawLevel.LevelId != "", &levelId, nil)
	level.LevelIndex = lib.IfThenElse(rawLevel.LevelIndex != "", &levelIndex, nil)
	level.LevelName = lib.IfThenElse(rawLevel.LevelName != "", &levelName, nil)

	return level
}
