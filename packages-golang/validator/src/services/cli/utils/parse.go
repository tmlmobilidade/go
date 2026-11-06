package utils

import (
	"flag"
	"fmt"
	"os"

	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/cli"
)

// Parse parses the command line arguments and sets the options in the CLI struct
func Parse(cli *types.CLI) {
	flag.StringVar(&cli.Options.InputPath, "input", "", "Path to the GTFS SQLite database")
	flag.StringVar(&cli.Options.OutputPath, "out", "", "Path to the output file")
	flag.StringVar(&cli.Options.OutputPath, "o", "", "Path to the output file")
	flag.StringVar(&cli.Options.LogLevel, "log", "info", "Log level (debug, info, error)")
	flag.StringVar(&cli.Options.RulesPath, "rules", "", "Path to the rules file")
	flag.StringVar(&cli.Options.StopsPath, "stops", "", "Path to the stops_data.json file")
	flag.StringVar(&cli.Options.RulesLang, "lang", "en", "Rules language (en, es, pt)")
	flag.BoolVar(&cli.Options.Version, "v", false, "Show version")
	flag.BoolVar(&cli.Options.Version, "version", false, "Show help")

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		flag.PrintDefaults()
	}

	flag.Parse()
}
