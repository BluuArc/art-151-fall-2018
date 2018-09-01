const fs = require('fs');

function isSiteDirectory (path) {
  const hasPde = (files = []) => files.some(name => name.endsWith('.pde'));
  const hasIndex = (files = []) => files.includes('index.html');
  try {
    const stats = fs.statSync(path);
    if (!stats.isDirectory()) {
      throw Error('Not a directory');
    }
    const pathFiles = fs.readdirSync(path);
    return hasPde(pathFiles) && hasIndex(pathFiles);
  } catch (err) {
    return false;
  }
}

function getSiteDirectoryConfig (path) {
  const meta = require(`./${path}/meta.json`);
  return {
    path,
    ...meta,
  };
}

function main () {
  const fileList = fs.readdirSync('.');
  const siteList = fileList.filter(isSiteDirectory).map(getSiteDirectoryConfig);

  fs.writeFileSync('sitemap.json', JSON.stringify(siteList, null, 2), 'utf8');
}

main();
