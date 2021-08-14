const fs = require('fs');
const archiver = require('archiver');
const chok = require('chokidar');
const sass = require('node-sass');
const ncp = require('ncp').ncp;
const args = process.argv.slice(2);

function zip(scene) {
  const out = fs.createWriteStream("./dist/" + scene + ".zip");
  const archive = archiver('zip');

  archive.on('warning', (err) => {
      if (err.code === 'ENOENT')
          console.log(err.message);
      else
          throw err;
  });

  archive.pipe(out);
  archive.directory(`build/${scene}/`, false);
  archive.finalize();

  return new Promise((resolve, reject) => {
    out.on('close', () => {
      console.log("Zipped scene " + scene + ", " + archive.pointer() + " bytes written");
      resolve();
    });

    archive.on('error', (err) => {
        reject(err);
    });
  });
}

function compile(scene) {
  return new Promise((resolve, reject) => {
    let ext = fs.existsSync(`./${scene}/overlay.scss`) ? '.scss' : fs.existsSync(`./${scene}/overlay.sass`) ? '.sass' : '';
    let html = `\n${fs.readFileSync(`./${scene}/overlay.html`)}`;
    const script = `<script>const ${scene} = document.querySelector('rl-scene[name="${scene}"]');</script>`;
    let index = html.indexOf("</rl-scene>") + 11;
    html = `${html.substr(0, index)}${script}${html.substr(index)}`;
    if(ext.length > 0) {
      sass.render({ data: `rl-scene[name='${scene}'] {${fs.readFileSync(`./${scene}/overlay${ext}`)}}`, outputStyle: 'compressed' }, (err, result) => {
        const css = result.css.toString();
        html = `<style>${css}</style>${html}`;
        ncp(`./${scene}`, `./build/${scene}`, { filter: /^[^.]+$|\.(?!(scss|sass|html)$)([^.]+$)/ }, (err) => {
          if(err)
            return reject(err[0]);
          fs.writeFileSync(`./build/${scene}/overlay.html`, html);
          resolve();
        });
      })
    }
    ncp(`./${scene}`, `./build/${scene}`, { filter: /^[^.]+$|\.(?!(scss|sass|html)$)([^.]+$)/ }, (err) => {
      if(err)
        return reject(err[0]);
      fs.writeFileSync(`./build/${scene}/overlay.html`, html);
      resolve();
    });
  });
}

if(fs.existsSync("./dist"))
  fs.rmdirSync("./dist", {recursive: true});
fs.mkdirSync("./dist");

if(!fs.existsSync("./build"))
  fs.mkdirSync("./build");

let scenes = fs.readdirSync("./", {withFileTypes: true})
  .filter(x => x.isDirectory())
  .map(x => x.name)
  .filter(x => fs.existsSync("./" + x + "/overlay.html"));

scenes.forEach(async (entry) => {
  // New process: put all styles under style tag rl-scene[name="NAME"]
  // compile scss
  // insert compiled css into a new style tag at top of html
  // add const SCENE_NAME = document.querySelector(...) to top of first script tag 
  
  if(args[0] && args[0] === "--watch") {
    chok.watch(`./${entry}`, { persistent: true, recursive: true })
      .on('change', async (path, stats) => {
        console.log(path);
        const name = path.includes('\\') ? path.split('\\')[0] : path;
        fs.rmSync(`./build/${name}`, { recursive: true });
        console.log(`[WATCH] Compiling ${name}...`);
        try {
          await compile(name);
          await zip(name);
        } catch(err) {
          console.log(`[WATCH] Failed to compile ${name}. ${err.message}`);
        }
        console.log(`[WATCH] Done compiling ${name}!`);
      })
      .on('error', (err) => {})
  } else {
    console.log("Zipping "+scenes.length+" scene" + (scenes.length == 1 ? "" : "s"));
    try {
      await compile(entry);
      await zip(entry);
    } catch(err) {
      console.error(`Failed to compile/zip: ${err.message}`);
    }
  }
});