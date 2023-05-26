"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kvToLocalsCSV = exports.csvToLocals = exports.updateLocalFilesFromCSV = exports.pushNewLocalTokenToCSV = exports.pushNewLinesToCSVFile = exports.localsToCSV = exports.pushNewTokensToCSV = void 0;
//@ts-nocheck
const plugin_error_1 = __importDefault(require("plugin-error"));
const through2_1 = __importDefault(require("through2"));
const glob_1 = __importDefault(require("glob"));
const fs_extra_1 = __importStar(require("fs-extra"));
const lodash_1 = __importDefault(require("lodash"));
const papaparse_1 = __importDefault(require("papaparse"));
const cli = require('cli-color');
const keyvalues = require('keyvalues-node');
const PLUGIN_NAME = `gulp-dotax:kvToLocalization`;
const removeBOM = (content) => {
    if (content.charCodeAt(0) === 0xfeff) {
        return content.slice(1);
    }
    return content;
};
const defaultCSVContent = { Tokens: 'addon_game_mode', English: 'YOUR ADDON NAME', SChinese: '你的游戏名' };
function pushNewTokensToCSV(csvFilePath, tokens) {
    if (!(0, fs_extra_1.existsSync)(csvFilePath)) {
        fs_extra_1.default.writeFileSync(csvFilePath, `\ufeff${papaparse_1.default.unparse([defaultCSVContent])}`);
    }
    let csv = fs_extra_1.default.readFileSync(csvFilePath, 'utf-8').toString();
    csv = removeBOM(csv);
    let parsed = papaparse_1.default.parse(csv, { header: true });
    let data = parsed.data;
    let header = parsed.meta.fields;
    let tokenKey = header[0];
    if (tokenKey == null)
        tokenKey = 'Tokens';
    tokens.forEach((token) => {
        if (data.find((row) => row[tokenKey] == token) == null) {
            data.push({ [tokenKey]: token });
        }
    });
    let csvContent = `\ufeff${papaparse_1.default.unparse(data)}`;
    try {
        fs_extra_1.default.writeFileSync(csvFilePath, csvContent);
    }
    catch (e) {
        console.log(cli.red(`文件写入失败，请检查权限或者文件是否被占用，跳过将本地化文本写入csv的过程！`));
    }
    finally {
        console.log(cli.green(`成功将新的token写入csv文件！${csvFilePath}`));
    }
}
exports.pushNewTokensToCSV = pushNewTokensToCSV;
function localsToCSV(localsPath, csvFilePath) {
    let files = glob_1.default.sync(localsPath);
    if (!(0, fs_extra_1.existsSync)(csvFilePath)) {
        fs_extra_1.default.writeFileSync(csvFilePath, `\ufeff${papaparse_1.default.unparse([defaultCSVContent])}`);
    }
    let csv = fs_extra_1.default.readFileSync(csvFilePath, 'utf-8').toString();
    csv = removeBOM(csv);
    let parsed = papaparse_1.default.parse(csv, { header: true });
    let headers = parsed.meta.fields;
    let tokenKey = headers[0];
    let data = parsed.data;
    files.forEach((file) => {
        let content = fs_extra_1.default.readFileSync(file, 'utf-8').toString();
        console.log('trying to get tokens from file: ' + file);
        let locals = keyvalues.decode(content);
        let lang = locals.lang.Language;
        headers = lodash_1.default.union(headers, [lang.trim()]);
        let tokens = locals.lang.Tokens;
        if (tokens == null)
            return;
        Object.keys(tokens).forEach((token) => {
            // 如果其中存在双引号，那么将他转义成csv中的双引号
            const val = tokens[token].replace(/"/g, '\\"');
            let row = data.find((row) => row[tokenKey] == token);
            if (row == null) {
                data.push({ [tokenKey]: token, [lang]: val });
            }
            else {
                let index = data.indexOf(row);
                data[index][lang] = val;
            }
        });
    });
    // 必须保证第一个元素有所有的header
    headers.forEach((h) => (data[0][h] = data[0][h] || ''));
    let csvContent = papaparse_1.default.unparse(data);
    try {
        fs_extra_1.default.writeFileSync(csvFilePath, `\ufeff${csvContent}`);
    }
    catch (e) {
        console.log(cli.red(`文件写入失败，请检查权限或者文件是否被占用，跳过将本地化文本写入csv的过程!`));
    }
}
exports.localsToCSV = localsToCSV;
function pushNewLinesToCSVFile(csvFilePath, localData) {
    if (!(0, fs_extra_1.existsSync)(csvFilePath)) {
        fs_extra_1.default.writeFileSync(csvFilePath, `\ufeff${papaparse_1.default.unparse([defaultCSVContent])}`);
    }
    let csv = fs_extra_1.default.readFileSync(csvFilePath, 'utf-8').toString();
    csv = removeBOM(csv);
    let parsed = papaparse_1.default.parse(csv, { header: true });
    let headers = parsed.meta.fields;
    let tokenKey = headers[0];
    let data = parsed.data;
    localData.forEach((line) => {
        const keyName = line.KeyName;
        if (data.find((row) => row[tokenKey] == keyName) == null) {
            data.push(Object.assign({ [tokenKey]: keyName }, lodash_1.default.omit(line, 'KeyName')));
        }
        else {
            const index = data.findIndex((row) => row[tokenKey] == keyName);
            Object.keys(line).forEach((kk) => {
                if (kk != 'KeyName') {
                    data[index][kk] = line[kk];
                }
            });
        }
    });
    // 必须保证第一个元素有所有的header
    headers.forEach((h) => (data[0][h] = data[0][h] || ''));
    let csvContent = papaparse_1.default.unparse(data);
    try {
        fs_extra_1.default.writeFileSync(csvFilePath, `\ufeff${csvContent}`);
    }
    catch (e) {
        console.log(cli.red(`文件写入失败，请检查权限或者文件是否被占用，跳过将本地化文本写入csv的过程!`));
    }
}
exports.pushNewLinesToCSVFile = pushNewLinesToCSVFile;
function pushNewLocalTokenToCSV(csvFilePath, locals) {
    if (!(0, fs_extra_1.existsSync)(csvFilePath)) {
        fs_extra_1.default.writeFileSync(csvFilePath, `\ufeff${papaparse_1.default.unparse([defaultCSVContent])}`);
    }
    let csv = fs_extra_1.default.readFileSync(csvFilePath, 'utf8').toString();
    csv = removeBOM(csv);
    let parsed = papaparse_1.default.parse(csv, { header: true });
    let data = parsed.data;
    let header = parsed.meta.fields;
    let tokenKey = header[0];
    if (tokenKey == null)
        tokenKey = 'Tokens';
    locals.forEach((local) => {
        if (local[tokenKey] != null) {
            if (data.find((row) => row[tokenKey] == local[tokenKey]) == null) {
                data.push(local);
            }
            else {
                let row = data.find((row) => row[tokenKey] == local[tokenKey]);
                Object.keys(local).forEach((key) => {
                    row[key] = local[key];
                });
                data[data.indexOf(row)] = row;
            }
        }
    });
    data.forEach((d) => {
        Object.entries(d).forEach(([key, value]) => {
            data[0][key] = data[0][key] || '';
        });
    });
    let csvContent = `\ufeff${papaparse_1.default.unparse(data)}`;
    try {
        fs_extra_1.default.writeFileSync(csvFilePath, csvContent);
    }
    catch (e) {
        console.log(cli.red(`文件写入失败，请检查权限或者文件是否被占用，跳过将本地化文本写入csv的过程！`));
    }
}
exports.pushNewLocalTokenToCSV = pushNewLocalTokenToCSV;
function updateLocalFilesFromCSV(localsPath, // 要输出的本地化文件的路径
existedLocalsPath = localsPath, // 其他包含本地化文本的文件夹，包括addon_*.txt，或者其他的以本插件格式保存的csv文件
languages = [], extraTokens = [], override = false) {
    let languageData = {};
    // read all addon_*.txt files in the output path
    const addonFiles = glob_1.default.sync(`${existedLocalsPath}/addon_*.txt`);
    // if there are extra languages, push them to the languages array
    if (!override) {
        addonFiles.forEach((addonFileName) => {
            let fileContent = fs_extra_1.default.readFileSync(addonFileName, 'utf-8').toString();
            // deal with the \n in the file
            const data = keyvalues.decode(fileContent);
            const language = data.lang.Language.trim();
            languages = lodash_1.default.uniq(lodash_1.default.concat(languages, language));
            languageData[language] = data.lang.Tokens || {};
            // escape \n in the tokens
            Object.keys(languageData[language]).forEach((token) => {
                languageData[language][token] = languageData[language][token].replace(/\\n/g, '\n').replace(/\\"/g, '__DOUBLE_QUOTE__');
            });
        });
    }
    const __existedTokens = [];
    // 读取addon.csv中已经修改的内容
    const csvFiles = glob_1.default.sync(`${existedLocalsPath}/*.csv`);
    csvFiles.forEach((csvFileName) => {
        let csv = fs_extra_1.default.readFileSync(csvFileName, 'utf8').toString();
        csv = removeBOM(csv);
        let parsed = papaparse_1.default.parse(csv, { header: true });
        let data = parsed.data;
        let header = parsed.meta.fields;
        let tokenKey = header[0];
        if (tokenKey == null)
            tokenKey = 'Tokens';
        languages = lodash_1.default.union(languages, header.slice(1));
        data.forEach((row) => {
            let tokenName = row[tokenKey];
            if (tokenName == null)
                return;
            if (__existedTokens.includes(tokenName)) {
                console.log(cli.yellow(`csv检测到重复的：${tokenName}`));
            }
            else {
                __existedTokens.push(tokenName);
            }
            languages.forEach((language) => {
                let tokenValue = row[language];
                if (tokenValue == null)
                    return;
                languageData[language] = languageData[language] || {};
                let escapedToken = tokenValue.toString().replace('\n', '\\n').replace(/\\"/g, '__DOUBLE_QUOTE__');
                // 如果有前面没有转义符的双引号存在，那么显示一个警告，并且将它转换成 __DOUBLE_QUOTE__
                if (/[\\]{0}"/.test(escapedToken)) {
                    console.log(cli.yellow(`csv检测到未转义的双引号：${tokenName}，强制将其转换为 '\\"'`));
                    escapedToken = escapedToken.replace(/[\\]{0}"/g, '__DOUBLE_QUOTE__');
                }
                languageData[language][tokenName] = escapedToken;
            });
        });
    });
    languages.forEach((lang) => {
        if (languageData[lang] == null) {
            languageData[lang] = {};
        }
        // push all the tokens that doesn't exist to the existedLanguageData
        if (extraTokens) {
            extraTokens.forEach((token) => {
                if (languageData[lang][token] == null) {
                    languageData[lang][token] = '';
                }
            });
        }
    });
    // write addon_{language}.txt files to localizationOutputPath
    languages.forEach((lang) => {
        let langD = languageData[lang];
        // convert \n to \\n
        Object.keys(langD).forEach((token) => {
            langD[token] = langD[token].replace(/\n/g, '\\n').replace(/__DOUBLE_QUOTE__/g, '\"');
            // if the content is null or empty, delete it
            if (langD[token] === null || langD[token] === '') {
                delete langD[token];
            }
        });
        const data = {
            lang: {
                Language: lang,
                Tokens: langD,
            },
        };
        const fileContent = keyvalues.encode(data);
        const fileName = `addon_${lang.toLocaleLowerCase()}.txt`;
        console.log(`dotax:csvToLoclas is now writing ${fileName}`);
        fs_extra_1.default.writeFileSync(`${localsPath}/${fileName}`, fileContent);
    });
}
exports.updateLocalFilesFromCSV = updateLocalFilesFromCSV;
function csvToLocals(localsPath) {
    return through2_1.default.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        // get the dirname of the file
        // it is ok to pass [] to the function, since it will update all languages from .csv header
        updateLocalFilesFromCSV(localsPath);
        callback();
    });
}
exports.csvToLocals = csvToLocals;
function kvToLocalsCSV(csvPath, options) {
    if (csvPath == null) {
        throw new plugin_error_1.default(PLUGIN_NAME, 'localizationOutPath is required, you should provide where addon_*.txt and addon.csv files are stored');
    }
    let { customPrefix, customSuffix, customToken, customIgnoreRule, transformTokenName: transformTokenNames, exportAbilityValues = true, exportKVModifiers = true, } = options || {};
    let localizationTokens = [];
    let specialKeys = [];
    function parseKV(file, enc, next) {
        if (file.isNull()) {
            return this.queue(file); // pass along
        }
        if (file.isStream()) {
            return this.emit('error', new plugin_error_1.default(PLUGIN_NAME, 'Streaming not supported'));
        }
        try {
            const kv = keyvalues.decode(file.contents.toString());
            Object.keys(kv).forEach((key) => {
                const kvContent = kv[key];
                Object.keys(kvContent).forEach((itemKey) => {
                    const itemValue = kvContent[itemKey];
                    const baseClass = itemValue.BaseClass;
                    // 默认的忽略规则，默认只有有BaseClass的才会被本地化
                    if (customIgnoreRule) {
                        if (customIgnoreRule(file.basename, key, itemValue, file.path)) {
                            return;
                        }
                    }
                    else {
                        if (baseClass == null)
                            return; // 只有有base class的才会被parse
                    }
                    let prefix = '';
                    if (customPrefix)
                        prefix = customPrefix(itemKey, itemValue, file.path) || '';
                    if (prefix === '') {
                        // 提供一些默认的前缀
                        if (/[item_|ability_]_[datadriven|lua]/.test(baseClass)) {
                            prefix = 'dota_tooltip_ability_';
                        }
                    }
                    let suffix = [''];
                    if (customSuffix) {
                        let customSuffixValue = customSuffix(itemKey, itemValue, file.path);
                        if (customSuffixValue) {
                            suffix = lodash_1.default.uniq(lodash_1.default.concat(suffix, customSuffixValue));
                        }
                    }
                    if (suffix.length == 1 && suffix[0] === '') {
                        // 提供一些默认的后缀
                        if (/[item_|ability_]_[datadriven|lua]/.test(baseClass)) {
                            suffix = lodash_1.default.uniq(lodash_1.default.concat(suffix, '_description'));
                            // 技能的AbilityValues和AbilitySpecials的处理
                            if (exportAbilityValues) {
                                let abilityValues = itemValue.AbilityValues;
                                if (abilityValues) {
                                    suffix = lodash_1.default.uniq(lodash_1.default.concat(suffix, Object.keys(abilityValues).map((s) => `_${s}`)));
                                }
                                let AbilitySpecial = itemValue.AbilitySpecial;
                                if (AbilitySpecial) {
                                    Object.keys(AbilitySpecial).forEach((data) => {
                                        const ss = AbilitySpecial[data];
                                        Object.keys(ss).forEach((s) => {
                                            if (!['var_type', 'LinkedSpecialBonus'].includes(s)) {
                                                suffix = lodash_1.default.uniq(lodash_1.default.concat(suffix, `_${s}`));
                                                specialKeys = lodash_1.default.uniq(lodash_1.default.concat(specialKeys, `"_${s}"`));
                                            }
                                        });
                                    });
                                }
                            }
                        }
                    }
                    let tokens = suffix.map((s) => `${prefix}${itemKey}${s}`);
                    if (customToken != null) {
                        let extraToekens = customToken(itemKey, itemValue, file.path);
                        tokens = lodash_1.default.uniq(lodash_1.default.concat(tokens, extraToekens));
                    }
                    // KV Modifiers的处理
                    if (exportKVModifiers) {
                        let modifiers = itemValue.Modifiers;
                        if (modifiers) {
                            Object.keys(modifiers).forEach((modifierName) => {
                                tokens = lodash_1.default.uniq(lodash_1.default.concat(tokens, `dota_tooltip_${modifierName}`, `dota_tooltip_${modifierName}_description`));
                            });
                        }
                    }
                    if (transformTokenNames != null) {
                        tokens = transformTokenNames(tokens, itemKey, itemValue, file.path);
                    }
                    localizationTokens = lodash_1.default.uniq(lodash_1.default.concat(localizationTokens, tokens));
                });
            });
            next();
        }
        catch (err) {
            return this.emit('error', new plugin_error_1.default(PLUGIN_NAME, err));
        }
    }
    function endStream() {
        pushNewTokensToCSV(csvPath, localizationTokens);
        this.emit('end');
    }
    return through2_1.default.obj(parseKV, endStream);
}
exports.kvToLocalsCSV = kvToLocalsCSV;
