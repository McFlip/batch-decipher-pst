# batch-decipher-pst

eDiscovery tool to decipher a collection of PST archives containing encrypted email

The output is a folder tree of custodians -> PST archives -> folder tree reflecting internal PST structure -> `*.msg` files with attachments contained in the file.

An exceptions report will also be generated in csv format.

## Limitations

This tool does not currently support nested encrypted emails as attachments. I plan on tackling this in a future version. These emails will be output to a "manual review" folder.

Output is in `*.msg` format. I don't have a way of writing the output to PST files. The output is intended to be ingested into another eDiscovery tool or review platform and these tools should be able to read the standard RFC format. MS Outlook and all major email clients will also open these files.

## Prerequisites

- A legit way of getting the encryption certs/keys. This is not a cracking tool.
- To only use the scripts in CLI, either Podman or Docker. Alternatively, a Debian based system to run the scripts natively.
- To run the full stack with web UI, a Linux system with Podman and ability to create a shared folder at `/srv/public`

## Usage

There are 2 parts to the process. The first uses signed emails from custodians to get certificate metadata to aid in gathering the necessary encryption certs from escrow.
The second part involves extracting keys from p12 containers and running the actual decipher job.
The web UI is set up in a wizard format and will walk you through the process.

Build the project by cloning this repo and following the build instructions below. 
Create a folder at `/srv/public` which is the location that output will be written to. Make sure your user account has `rwx` permissions on the folder.
The app will run with user privileges. I run with port 8080 instead of the default 443 to avoid using root privileges. You can modify this by adding capabilities to the beeKeeper container if you wish to run on port 443.

Stand up the project in production by running `./compose.bash`.

Stand up the project in development by running `./compose.dev.bash`.

Stand down the project by running

```bash
podman pod stop batch-decipher-pst
podman pod rm batch-decipher-pst
```

## Security

No keys are stored to disk unencrypted, but it is your responsibility to use a strong password for extracted keys.
The output emails are in plain text so ensure you have properly managed permissions on the output folder at `/srv/public`.
Secrets are passed in to the scripts using environment variables. This assumes they are running inside a container that only lives long enough to run the script.

## Build

This tool is meant to be run on a Linux system running Podman. It has a Web UI, REST API, and a set of scripts packaged in a container.
When a job is run the API spins up a container that runs the actual script that does the work.

If you prefer to work in a CLI environment, you can use the scripts directly from inside the `busyBee` folder.
Build the busyBee container with the build script `./build.bash "busyBee"` or if using Docker simply use the provided Dockerfile inside busyBee.

To build the complete project, create a config file in `beeKeeper` named `.env.production.local`. See below for an example. Next, run `./build.bash "all"`. This script will also update dependancies and create a new `latest` image for each container.
Finally, upload the images from `images/*.tar` to your production server and load into your localhost registry with `podman load < *.tar`

```
# .env.production.local
# Set web port to 8080 instead of 443
PORT=8080
# Client side fetch URL
NEXT_PUBLIC_API_EXTERNAL="https://example.org"
# Server side rendering
API_INTERNAL="https://localhost"
# Next-Auth
NEXTAUTH_URL="https://example.org:8080"
NEXTAUTH_SECRET="secretSquirrel"
```

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

Change to the beeKeeper directory.

If you haven't installed the dependancies yet then run a clean install

```bash
podman run -it --rm --security-opt label=disable -v $(pwd):/app --workdir /app node:current npm ci
```
This will run tests in watch mode. Press `q` to quit.

```bash
podman run -it --rm --name beekeeper_test -v $(pwd):/app:Z -w /app node:current npm test
```

### End to End Testing with Cypress

Reset the dev stack to a clean state

```bash
podman pod stop batch-decipher-pst
podman pod rm batch-decipher-pst
podman volume rm batch-decipher-pst_hive
./compose.dev.bash
```

Run Cypress from inside the beeKeeper folder `npx cypress open`

1. Click E2E Testing
2. Click Start E2E Testing in Electron
3. Run the `workflow` test

Reset the stack again if desired i.e. to run the tests again in Firefox.


## Dev

Run the tests first to ensure you have installed all dependancies. 

To work on the UI and API stand up the dev servers with `compose.dev.bash`.

To work on the BASH scripts use a busybee container.

```bash
cd beeKeeper
podman run -it --name=busybee_dev -v $(pwd):/app:z busybee bash
```

If you make changes to the busy bee scripts make sure you re-build the container before moving on to work on the UI/API.