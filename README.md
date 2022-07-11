# batch-decipher-pst
eDiscovery tool to decipher a collection of PST archives containing encrypted email

## Testing

### Busy Bee

Build the Busy Bee image `build.bash "busyBee"`

Next, build the test container
```bash
cd busyBee/spec
buildah bud -t test-busybee .
```

Change back to the busyBee folder and run the test container, mounting the current working directory in order to avoid rebuilding after each edit.
```bash
cd ..
podman run -it --rm -v $(pwd):/app:z test-busybee
```

### Queen Bee

Run all commands from inside the `queenBee` dir

If you haven't installed the dependancies yet then run a clean install

```bash
podman run -it --rm --security-opt label=disable -v $(pwd):/app --workdir /app node:current npm ci
```

Build the test container `buildah bud -t test-queenbee .`

Create the podman socket at `batch-decipher-pst/podman`

```bash
podman system service -t 0 unix:$(pwd)/podman.sock &
```

Run the test container

```bash
# Get stderr and color output
podman run -it --privileged --env NODE_ENV='test' --rm -v $(pwd):/app:z -v test_hive:/app/workspace -v test_share:/srv/public -v $(pwd)/../podman/podman.sock:/var/run/docker.sock:z test-queenbee npm test
# Suppress stderr for less noise on tests that 'fail' succussfuly 
podman run --privileged --env NODE_ENV='test' --attach stdout --rm -v $(pwd):/app:z -v test_hive:/app/workspace -v test_share:/srv/public -v $(pwd)/../podman/podman.sock:/var/run/docker.sock:z test-queenbee npm test
# Get debug output
podman run -it --privileged --env NODE_ENV='test' --env DEBUG='decipher' --rm -v $(pwd):/app:z -v test_hive:/app/workspace -v test_share:/srv/public -v $(pwd)/../podman/podman.sock:/var/run/docker.sock:z test-queenbee npm test
```

The test is configured to bail on the 1st failure.

### Bee Keeper

Change to the beeKeeper directory. This will run tests in watch mode. Press `q` to quit.

```bash
podman run -it --rm --name beekeeper_test -v $(pwd):/app:Z -w /app node:current npm test
```

### End to End Testing with Cypress

Reset the dev stack to a clean state

```bash
podman pod stop batch-decipher-pst
podman volume rm batch-decipher-pst_hive
./compose.dev.bash
```

Run Cypress from inside the beeKeeper folder `npx cypress open`


## Dev

Run the tests first to ensure you have installed all dependancies. 

To work on the UI and API stand up the dev servers with `compose.dev.bash`.

To work on the BASH scripts use a busybee container.

```bash
cd beeKeeper
podman run -it --name=busybee_dev -v $(pwd):/app:z busybee bash
```

If you make changes to the busy bee scripts make sure you re-build the container before moving on to work on the UI/API.