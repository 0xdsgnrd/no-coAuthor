'use strict'

var fs = require('fs')
var path = require('path')
var execSync = require('child_process').execSync
var hookNode = require('./hook.js')
var hookPosix = require('./hook-posix.js')

function getHookTemplate(forceNoNode) {
  if (forceNoNode) return hookPosix
  return hookNode
}

module.exports = function install(isGlobal, noNode) {
  var hookTemplate = getHookTemplate(noNode)

  function writeHook(hookPath) {
    fs.writeFileSync(hookPath, hookTemplate, { mode: 0o755 })
  }

  if (isGlobal) {
    var globalDir = path.join(require('os').homedir(), '.git-hooks')
    fs.mkdirSync(globalDir, { recursive: true })

    var hookPath = path.join(globalDir, 'commit-msg')
    writeHook(hookPath)

    // Check if core.hooksPath is already set to something else
    var existing = ''
    try {
      existing = execSync('git config --global core.hooksPath', { encoding: 'utf8' }).trim()
    } catch (e) {
      // Not set yet
    }

    if (existing && existing !== globalDir) {
      console.log('no-coauthor: warning — core.hooksPath was already set to: ' + existing)
      console.log('no-coauthor: overwriting to: ' + globalDir)
    }

    execSync('git config --global core.hooksPath ' + globalDir)
    console.log('no-coauthor: global hook installed at ' + globalDir)
    console.log('no-coauthor: all git repos on this machine will strip AI co-author lines')
  } else {
    var gitRoot
    try {
      gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim()
    } catch (e) {
      console.error('no-coauthor: not inside a git repository')
      process.exit(1)
    }

    var hooksDir = path.join(gitRoot, '.git', 'hooks')
    fs.mkdirSync(hooksDir, { recursive: true })

    var hookFile = path.join(hooksDir, 'commit-msg')

    // Check for existing hook
    if (fs.existsSync(hookFile)) {
      var content = fs.readFileSync(hookFile, 'utf8')
      if (content.includes('no-coauthor') || content.includes('Co-Authored-By')) {
        writeHook(hookFile)
        console.log('no-coauthor: hook updated in ' + hooksDir)
        return
      }
      // Existing hook from another tool — append
      console.log('no-coauthor: existing commit-msg hook found, appending')
      fs.appendFileSync(hookFile, '\n\n# --- no-coauthor ---\n' + hookTemplate)
      fs.chmodSync(hookFile, 0o755)
      console.log('no-coauthor: hook appended in ' + hooksDir)
      return
    }

    writeHook(hookFile)
    console.log('no-coauthor: hook installed in ' + hooksDir)
  }
}
