'use strict'

var fs = require('fs')
var path = require('path')
var execSync = require('child_process').execSync

module.exports = function uninstall(isGlobal) {
  if (isGlobal) {
    var globalDir = path.join(require('os').homedir(), '.git-hooks')
    var hookPath = path.join(globalDir, 'commit-msg')

    if (fs.existsSync(hookPath)) {
      fs.unlinkSync(hookPath)
      console.log('no-coauthor: global hook removed from ' + globalDir)
    } else {
      console.log('no-coauthor: no global hook found')
    }

    // Check if the hooks dir is now empty — if so, unset core.hooksPath
    try {
      var remaining = fs.readdirSync(globalDir)
      if (remaining.length === 0) {
        execSync('git config --global --unset core.hooksPath')
        fs.rmdirSync(globalDir)
        console.log('no-coauthor: global hooks directory removed and core.hooksPath unset')
      }
    } catch (e) {
      // Directory might not exist or config might not be set
    }
  } else {
    var gitRoot
    try {
      gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim()
    } catch (e) {
      console.error('no-coauthor: not inside a git repository')
      process.exit(1)
    }

    var hookFile = path.join(gitRoot, '.git', 'hooks', 'commit-msg')

    if (!fs.existsSync(hookFile)) {
      console.log('no-coauthor: no hook found')
      return
    }

    var content = fs.readFileSync(hookFile, 'utf8')

    // Check if this is our hook or someone else's
    if (content.includes('# --- no-coauthor ---')) {
      // We appended to an existing hook — remove only our section
      var cleaned = content.replace(/\n\n# --- no-coauthor ---\n[\s\S]*$/, '')
      fs.writeFileSync(hookFile, cleaned, { mode: 0o755 })
      console.log('no-coauthor: removed from existing hook in ' + path.dirname(hookFile))
    } else if (content.includes('Co-Authored-By')) {
      // This is our standalone hook
      fs.unlinkSync(hookFile)
      console.log('no-coauthor: hook removed from ' + path.dirname(hookFile))
    } else {
      console.log('no-coauthor: commit-msg hook exists but was not installed by no-coauthor')
    }
  }
}
