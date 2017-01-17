# Open Budget / Versió Ajuntament d'Inca

Aquesta eina és una adaptació del projecte de codi lliure [Open Budget](https://github.com/CityOfPhiladelphia/open-budget) desenvolupat per [City of Philadelphia’s Office of Innovation and Technology](http://www.phila.gov/data/), que està basat en el projecte de [OpenData.ch](https://github.com/tpreusse/open-budget), la secíó suïssa de la [Open Knowledge Foundation](http://okfn.org/).

## Setup
First, clone the repository and from within project directory install dependencies via:
```
$ npm install
```
Make your changes and view the application in its development at `/src`.

_Note: to preview data visualization, browser preview requires running a local webserver_

## Build
Optimize the application by running:
```
$ npm run build
```

## Commit
Commit the compiled site to `master` branch
```
$ git commit -a
```

This will update the files in the `/dist` directory. To push that directory to the `gh-pages` branch of the repo, use:
```
$ git subtree push --prefix dist origin gh-pages
```

## Dependencies
- Underscore.js
- d3.js
- Foundation 5
- jQuery

## Data Format
<!--* See the [open-budget-data-transformer](https://github.com/CityOfPhiladelphia/open-budget-data-transformer) repo -->
* See the parent repo's [Data Format](https://github.com/tpreusse/open-budget/wiki/Data-Format) documentation
* We built a data transformer to go along with this and will be publishing the source code shortly
