const spawn = require('child_process').spawn;
const path = require('path');

const runGulp = function(done) {
  const g = spawn(process.platform === 'win32' ? 'gulp.cmd' : 'gulp', [ 'default' ]);
  g.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  g.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  g.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    done && done();
  });
}

module.exports = runGulp;
