fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios setup_signing

```sh
[bundle exec] fastlane ios setup_signing
```

Set up code signing

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Push a new beta build to TestFlight

### ios rename_app

```sh
[bundle exec] fastlane ios rename_app
```

Rename the app to 'FI Investments'

### ios update_app_store_name

```sh
[bundle exec] fastlane ios update_app_store_name
```

Ändert den App-Namen in App Store Connect

### ios distribute_external

```sh
[bundle exec] fastlane ios distribute_external
```

Aktuellen Build für externe Tester in TestFlight freigeben

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
