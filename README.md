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