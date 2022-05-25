# batch-decipher-pst
eDiscovery tool to decipher a collection of PST archives containing encrypted email

## Testing

### Busy Bee

Build the Busy Bee image `build.dev.bash`

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

Run the test container

```bash
podman run -it --rm -v $(pwd):/app:z test-queenbee npm test
```

The test is configured to bail on the 1st failure.