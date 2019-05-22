workflow "Run tests" {
  on = "push"
  resolves = ["npm publish"]
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

action "Only on master" {
  uses = "actions/bin/filter@master"
  needs = ["npm test"]
  args = "branch master"
}

action "npm publish" {
  uses = "actions/npm@master"
  needs = ["Only on master"]
  args = "publish"
  secrets = ["NPM_AUTH_TOKEN"]
}
