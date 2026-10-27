package importgtfs

/* * */

import (
	"archive/zip"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
)

/* * */

// Resolves a local archive or downloads it to a temporary file.
func prepareSourcePath(source ImportGtfsConfigSource) (string, func(), error) {
	cleanup := func() {}
	if (source.Path == "") == (source.Url == "") {
		return "", cleanup, errors.New("source must contain exactly one of Path or Url")
	}
	if source.Path != "" {
		return source.Path, cleanup, nil
	}

	telemetry.Logger.Progress("Downloading GTFS archive from " + source.Url)
	client := http.Client{Timeout: 30 * time.Minute}
	response, err := client.Get(source.Url)
	if err != nil {
		return "", cleanup, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", cleanup, fmt.Errorf("download GTFS: %s", response.Status)
	}
	file, err := os.CreateTemp("", "import-gtfs-*.zip")
	if err != nil {
		return "", cleanup, err
	}
	cleanup = func() { os.Remove(file.Name()) }
	_, copyError := io.Copy(file, response.Body)
	closeError := file.Close()
	if err := errors.Join(copyError, closeError); err != nil {
		cleanup()
		return "", func() {}, err
	}
	return file.Name(), cleanup, nil
}

// Opens the archive before touching the output database.
func prepareSource(source ImportGtfsConfigSource) (*zip.ReadCloser, func(), error) {
	sourcePath, cleanup, err := prepareSourcePath(source)
	if err != nil {
		return nil, cleanup, err
	}
	archive, err := zip.OpenReader(sourcePath)
	if err != nil {
		cleanup()
		return nil, func() {}, err
	}
	return archive, func() { archive.Close(); cleanup() }, nil
}
