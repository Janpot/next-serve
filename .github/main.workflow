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
  needs = ["run npm ci"]
  args = "test"
}
