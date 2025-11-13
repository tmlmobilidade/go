## MapView

To render maps there are three components:

1. The global `<MapContext/>` context provider — this keeps track of options (zoom, center, etc.) and handles the setting of `react-map-gl` providers also.

2. The `<MapView />` component — this acts as the basemap + toolbar required to render the overlays. This also wraps an independent context to manage the state of the MapView instance and it's children overlays.

3. The `<MapOverlays... />` components — these are the individual source+layer types used to render features on the map. They interact with the parent `<MapView />` and `<MapViewContext />` components and therefore require to be children of a `<MapView />` to function properly.