let dir = process.env['INPUT_DIRECTORY']

if (!dir) {
  console.error('INPUT_DIRECTORY must be set');
  process.exit(1);
}
import {stat, readdir, writeFile} from 'fs/promises'
import {minify} from 'minify';

try {
  const dirStat = await stat(dir);
  if (!dirStat.isDirectory()) {
    console.error(`${dir} exists but is not a directory`);
    process.exit(1);
  }
} catch (e) {
  console.error(`${dir} might not exist:`, e);
  process.exit(1);
}

for (let file of await readdir(dir)) {
  if (file.match(/\.min\.(js|css)$/)) {
    continue;
  }
  let [, name, ext] = file.match(/^(.+)\.(js|css)$/)
  // console.log(`Found ${name} ${ext}`)
  try {
    let minified = await minify(`${dir}/${file}`);
    await writeFile(`${dir}/${name}.min.${ext}`, minified);
    console.log(`Wrote ${name}.min.${ext}`)
  } catch (e) {
    console.error(`Could not minify ${file}`, e);
    process.exit(1);
  }
}
