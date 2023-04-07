const fs            = require('fs');
const { promisify } = require('util');
const writeToFile   = promisify(fs.writeFile);
const JSONLocaleFilePath    = 'src/common/locales/all.json';
const JSONtoIOSKeyMap = {
	en: 'en',
	ar: 'ar',
	da: 'da',
	de: 'de',
	el: 'el',
	'en-AU': 'en-AU',
	'en-GB': 'en-GB',
	'en-NZ': 'en-NZ',
	es: 'es',
	fi: 'fi',
	fr: 'fr',
	he: 'he',
	hu: 'hu',
	it: 'it',
	ja: 'ja',
	ko: 'ko',
	nl: 'nl',
	'pt-BR': 'pt-BR',
	'pt-PT': 'pt-PT',
	ru: 'ru',
	sv: 'sv',
	tr: 'tr',
	'zh-CN': 'zh-Hans',
	'zh-TW': 'zh-Hant'
};
const infoPlistKeys = {
	"NSLocationWhenInUseUsageDescription" : "alert.desc.loc_perm",
	"NSMicrophoneUsageDescription"        : "alert.desc.mic_perm",
	"NSPhotoLibraryUsageDescription"      : "alert.desc.camera_perm",
	"NSCameraUsageDescription"            : "alert.desc.camera_perm",
};
const currentDate = new Date().toLocaleDateString('en-GB');
const fileHeader = String.raw`/*
  InfoPlist.strings
  pa

  Auto generated using script on ${currentDate}.
*/`

function makeFileLines (langCode, JSONLocale) {
	let lines = [fileHeader];
	for (let infoPlistKey in infoPlistKeys) {
		let [section, subsection, key] = infoPlistKeys[infoPlistKey].split(".");
		lines.push(`${infoPlistKey} = "${JSONLocale[langCode][section][subsection][key]}";`);
	}
	return lines;
}

async function make () {
	try {
		let JSONLocale = JSON.parse(fs.readFileSync(JSONLocaleFilePath, 'utf8'));
		console.log(JSONLocaleFilePath, "JSON loaded successfully");
		for (let langKey in JSONtoIOSKeyMap) {
			let fileNameFrag = JSONtoIOSKeyMap[langKey];
			let fileName = `ios/${fileNameFrag}.lproj/InfoPlist.strings`
			let lines        = makeFileLines(langKey, JSONLocale);
			let fileData     = lines.join("\n");
			await writeToFile(fileName, fileData);
			console.log (`Updated ${fileName}`);
		}
	}
	catch (err) {
		console.error(err);
		process.exit();
	}
}

make ();
