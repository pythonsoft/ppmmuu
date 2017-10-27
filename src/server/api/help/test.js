const exec = require('child_process').exec;

const originPath = '/Users/chaoningxie/WebstormProjects/ump/src/server/api/help/';
const targetPath = '/Users/chaoningxie/Desktop/temp';

exec(`cp -rf ${originPath} ${targetPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }

  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
