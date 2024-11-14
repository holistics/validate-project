# Validate Project GitHub Action

Validate AML Project with GitHub Action

Example usage

```yml
name: Validate Project

on:
  push:
    branches:
      - '**'

jobs:
  validate-project:
    runs-on: ubuntu-latest

    env:
      HOLISTICS_API_KEY: ${{ secrets.HOLISTICS_API_KEY }}
      HOLISTICS_HOST: "https://secure.holistics.io"
      # https://eu.holistics.io
      # https://us.holistics.io

    steps:
      - name: Validate Project
        uses: holistics/validate-project

```
