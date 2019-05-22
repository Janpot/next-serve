workflow "Run tests" {
  on = "push"
  resolves = ["GitHub Action for npm"]
}

action "run npm ci" {
  uses = "actions/npm@master"
  args = "ci"
}

action "GitHub Action for npm" {
  uses = "actions/npm@master"
  needs = ["run npm ci"]
  args = "test"
}
