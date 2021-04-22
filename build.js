const fs = require('fs');
const archiver = require('archiver');

if(fs.existsSync("./build"))
    fs.rmdirSync("./build", {recursive: true});
fs.mkdirSync("./build");

let scenes = fs.readdirSync("./", {withFileTypes: true})
    .filter(x => x.isDirectory())
    .map(x => x.name)
    .filter(x => fs.existsSync("./" + x + "/overlay.html"));

console.log("Zipping "+scenes.length+" scene" + (scenes.length == 1 ? "" : "s"));

scenes.forEach((entry) => {
    const out = fs.createWriteStream("./build/" + entry + ".zip");
    const archive = archiver('zip');

    out.on('close', () => {
        console.log("Zipped scene " + entry + ", " + archive.pointer() + " bytes written");;
    });

    archive.on('warning', (err) => {
        if (err.code === 'ENOENT')
            console.log(err.message);
        else
            throw err;
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(out);
    archive.directory(entry + "/", false);
    archive.finalize();
});