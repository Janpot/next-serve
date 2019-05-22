workflow "Run tests" {
  on = "push"
  resolves = ["npm test"]
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
