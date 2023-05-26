"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kvToJS = void 0;
//@ts-nocheck
const plugin_error_1 = __importDefault(require("plugin-error"));
const through2_1 = __importDefault(require("through2"));
const vinyl_1 = __importDefault(require("vinyl"));
const path_1 = __importDefault(require("path"));
const easy_keyvalues_1 = require("easy-keyvalues");
const PLUGIN_NAME = `gulp-dotax:kvToJS`;
function kvToJS(options) {
    const { AutoConvertToArray = true, ArraySeperator = /[\|#]/, AutoMergeBases = true, } = options !== null && options !== void 0 ? options : {};
    const parseKV = (file, enc, next) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (file.isNull()) {
            return next(null, file);
        }
        if (file.isStream()) {
            return next(new plugin_error_1.default(PLUGIN_NAME, 'Streaming not supported'), file);
        }
        try {
            const kvFileName = file.path;
            const kv = (0, easy_keyvalues_1.LoadKeyValuesSync)(kvFileName);
            let kvData = kv.toObject();
            delete kvData['#base']; // 移除所有的 #base，他们不需要被输出
            kvData = (_a = kvData[Object.keys(kvData)[0]]) !== null && _a !== void 0 ? _a : {}; // 有可能主文件里面除了 #base 以外没有任何内容
            // 将所有的 #base 的内容合并到root
            // 这里有可能会有循环调用，因此不做递归
            // 坏处是不支持多层级的 #base
            // todo: 支持多层级的 #base
            if (AutoMergeBases) {
                (0, easy_keyvalues_1.AutoLoadKeyValuesBaseSync)(kv, path_1.default.dirname(kvFileName));
                kv.GetChildren().forEach((child) => {
                    if (child.Key === '#base') {
                        const childObject = child.toObject();
                        delete childObject['#base'];
                        Object.assign(kvData, childObject[Object.keys(childObject)[0]]);
                    }
                });
            }
            let jsonData = JSON.stringify(kvData, (key, value) => {
                // 如果是数字，直接输出数字
                if (typeof value === 'string' && !isNaN(Number(value))) {
                    return Number(value);
                }
                // 如果是用 '|' 或者 '#' 分割的字符串，那么直接输出成数组
                // 如果AutoConvertToArray为true的话
                // 默认为true
                if (AutoConvertToArray &&
                    typeof value === 'string' &&
                    ArraySeperator.test(value)) {
                    return value.split(ArraySeperator).filter(item => item !== "").map((v) => v.trim());
                }
                return value;
            }, '  ');
            // convert all line ending from LF to CRLF
            jsonData = jsonData.replace(/\r\n/g, '\n');
            // change base of file.basename to .json
            const jsonFileName = file.basename.replace(path_1.default.extname(file.basename), '.json');
            const jsonFile = new vinyl_1.default({
                base: file.base,
                path: file.path,
                basename: jsonFileName,
                contents: Buffer.from(jsonData),
            });
            next(null, jsonFile);
        }
        catch (err) {
            return next(new plugin_error_1.default(PLUGIN_NAME, err), file);
        }
    });
    return through2_1.default.obj(parseKV);
}
exports.kvToJS = kvToJS;
