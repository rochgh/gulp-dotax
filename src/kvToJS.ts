//@ts-nocheck
import PluginError from "plugin-error";
import through from "through2";
import Vinyl from "vinyl";
import path from "path";

const keyvalues = require("keyvalues-node");

const PLUGIN_NAME = `gulp-dotax:kvToJS`;

export function kvToJS() {
    function parseKV(file: Vinyl, enc: any, next: Function) {
        if (file.isNull()) {
            return this.queue(file); // pass along
        }

        if (file.isStream()) {
            return this.emit("error", new PluginError(PLUGIN_NAME, "Streaming not supported"));
        }

        try {
            const kv = keyvalues.decode(file.contents.toString());
            const kvKeys = Object.keys(kv);
            const kvData = kvKeys.length === 1 ? kv[kvKeys[0]] : kv;
            const jsonData = JSON.stringify(kvData, undefined, '  ');
            // change base of file.basename to .json
            const jsonFileName = file.basename.replace(path.extname(file.basename), ".json");
            const jsonFile = new Vinyl({
                base: file.base,
                path: file.path,
                basename: jsonFileName,
                contents: Buffer.from(jsonData),
            });
            this.push(jsonFile);
            next();
        } catch (err) {
            return this.emit("error", new PluginError(PLUGIN_NAME, err));
        }
    }

    return through.obj(parseKV);
}
