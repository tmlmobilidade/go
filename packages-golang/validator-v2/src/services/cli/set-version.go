package cli

// displayVersion is configured by the validator entrypoint before parsing flags.
var displayVersion string

// SetDisplayVersion sets the display version
func SetDisplayVersion(v string) { displayVersion = v }
