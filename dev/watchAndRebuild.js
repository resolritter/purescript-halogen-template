#!/bin/node

const _ = require("lodash")
const chokidar = require("chokidar")
const path = require("path")
const cp = require("child_process")
const process = require("process")
const projectRoot = path.join(__dirname, "..")

const watcher = chokidar.watch(projectRoot + "/src/**/*.purs", {
  persistent: true,
})

class Runner {
  static isProcessRuning = false
  static isRestartEnqueued = false
  static isServing = false

  static serve() {
    if (Runner.isServing) {
      return
    }

    Runner.isServing = true
    process.stdout.write("Serving the build...")
    cp.exec("npm run serve", { cwd: projectRoot })
  }

  static build() {
    console.clear()
    process.stdout.write("Compiling...")
    cp.exec("npm run build", { cwd: projectRoot }, Runner.afterBuild)
  }

  static enqueueBuildStart() {
    if (Runner.isProcessRunning) {
      Runner.isRestartEnqueued = true
    } else {
      Runner.isProcessRunning = true
      Runner.build()
    }
  }

  static afterBuild(err, stdoutOutput, stderrOutput) {
    console.clear()

    if (err) {
      stderrOutput =
        stderrOutput || stdoutOutput || "Build errored with no message"
      process.stdin.write("Compilation failed\n\n")
      process.stdout.write(stderrOutput)
    } else {
      process.stdin.write("Compilation succeeded\n\n")
      process.stdin.write(stdoutOutput)
      Runner.serve()
    }

    Runner.isProcessRunning = false
    const wasRestartEnqueued = Runner.isRestartEnqueued

    if (wasRestartEnqueued) {
      Runner.build()
    }

    Runner.isRestartEnqueued = false
  }
}

for (const buildTrigger of ["add", "change", "unlink"]) {
  watcher.on(buildTrigger, Runner.enqueueBuildStart)
}

Runner.build()
