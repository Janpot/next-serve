workflow "Run tests" {
  on = "push"
  resolves = ["Run npm test"]
}

action "Run npm test" {
  uses = "actions/npm@master"
  args = "test"
}
