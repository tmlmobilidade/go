# Gestor de Oferta (GO v2)

### Development steps

1. `npm i`

2. `npm run watch:packages` to build and keep watching the packages. Wait a few moments until all packages are built. Because it is a watcher it is not possible to set an execution order. Errors will appear for missing dependencies, but they will gradually disappear.

2. `npm run dev:auth` to start the required auth module.

3. `npm run dev:{module}` to start the desired module.