# Validate AML GitHub Action

Validate AML Project with GitHub Action

Example usage

```yml
name: Validate AML

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master
    types:
      - closed

jobs:
  publish-aml:
    if: github.event.pull_request.merged == true || github.event_name == 'push'
    runs-on: ubuntu-latest

    # API Key and Holistics Host
    env:
      HOLISTICS_API_KEY: ${{ secrets.HOLISTICS_API_KEY }}
      HOLISTICS_HOST: 'https://secure.holistics.io'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Validate AML # run validation
        uses: holistics/validate-aml@v1.0
```
