workflow "Run tests" {
  on = "push"
  resolves = ["GitHub Action for npm"]
}

action "npm ci" {
  uses = "actions/npm@master"
  args = "ci"
}

action "npm test" {
  uses = "actions/npm@master"
  needs = ["npm ci"]
  args = "test"
}

action "Filters for GitHub Actions" {
  uses = "actions/bin/filter@master"
  needs = ["npm test"]
  args = "branch master"
}

action "GitHub Action for npm" {
  uses = "actions/npm@master"
  needs = ["Filters for GitHub Actions"]
}
