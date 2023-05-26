"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imagePrecacche = void 0;
const vinyl_1 = __importDefault(require("vinyl"));
const path_1 = __importDefault(require("path"));
const through2_1 = __importDefault(require("through2"));
function imagePrecacche(root) {
    let files = [];
    let firstFile;
    function collect(file, enc, next) {
        if (firstFile == null)
            firstFile = file;
        let relativePath = path_1.default.relative(root, file.path);
        // 如果名称包含中文，那么略过
        if (/[\u4e00-\u9fa5]+/g.test(relativePath)) {
            console.log("ignore file since it contains chinese: " + relativePath);
            next();
            return;
        }
        files.push(relativePath.replace(/\\/g, '/'));
        next();
    }
    function write(done) {
        if (firstFile == null)
            return done();
        files = files.sort();
        let fileGroups = [];
        for (let i = 0; i < files.length; i += 500) {
            fileGroups.push(files.slice(i, i + 500));
        }
        fileGroups.forEach((files, i) => {
            let content = `.image-precache {\n${files.map((filename) => `\tbackground-image: url("file://{images}/${filename}");`).join("\n")}\n}`;
            content = content.replace(/\r\n/g, '\n');
            const file = new vinyl_1.default({
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: path_1.default.join(firstFile.base, `image_precache${i}.css`),
                contents: Buffer.from(content),
            });
            //@ts-ignore
            this.push(file);
        });
        done();
    }
    return through2_1.default.obj(collect, write);
}
exports.imagePrecacche = imagePrecacche;
