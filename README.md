# Gestor de Oferta (GO v2)

### Development steps

1. `npm i`

2. `npm run watch:packages` to build and keep watching the packages. Wait a few moments until all packages are built. Because it is a watcher it is not possible to set an execution order. Errors will appear for missing dependencies, but they will gradually disappear.

2. `npm run dev:auth` to start the required auth module.

3. `npm run dev:{module}` to start the desired module.

## Dump

mongodump \
--host=sae-db-rs0-1-production.carrismetropolitana.pt:27017,sae-db-rs0-2-production.carrismetropolitana.pt:27017,sae-db-rs0-3-production.carrismetropolitana.pt:27017 \
--username=backup \
--password=PASSWORD \
--authenticationDatabase=admin \
--excludeCollection=rides \
--excludeCollection=ride_acceptances \
--excludeCollection=hashed_shapes \
--excludeCollection=hashed_trips \
--excludeCollection=simplified_apex_locations \
--excludeCollection=simplified_apex_on_board_refunds \
--excludeCollection=simplified_apex_on_board_sales \
--excludeCollection=simplified_apex_validations \
--excludeCollection=sams \
--excludeCollection=metrics \
--excludeCollection=localities \
--excludeCollection=parishes \
--excludeCollection=census \
--excludeCollection=districts \
--excludeCollection=municipalities \
--excludeCollection=vehicle_events \
--db=production \
--gzip \
--archive=./production.dump

## Devcontainer workflow

The repository now includes a team devcontainer setup under `.devcontainer/`.

Start here for setup and SSH tunnel usage:
- `.devcontainer/README.md`