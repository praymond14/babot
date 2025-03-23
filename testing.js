// const { babaUntilHolidays } = require("./commandFunctions");
// const { LoadAllTheCache, StartDB } = require("./databaseVoiceController");

// global.dbAccess = [!process.argv.includes("-db"), process.argv.includes("-db") ? false : true];

// StartDB("Init");
// LoadAllTheCache().then(() => {
//     var evt = babaUntilHolidays("!baba wednesday christmas", { id: "360228104997961740" }, "04");
//     console.log(evt);
// });
async function checkForMorshus(text)
{
	// check for {MORSHUIFY_AUDIO} or {MORSHUIFY_VIDEO}
	// if found, replace all text after with morshu audio in 900 char chunks (split on spaces if possible)

	if (text.includes("{MORSHUIFY_AUDIO}"))
	{
		var start = text.indexOf("{MORSHUIFY_AUDIO}");
        var end = text.length;
        var morshutext = text.substring(start, end);

		text = text.replace(morshutext, "").trim();
        morshutext = morshutext.replaceAll("{MORSHUIFY_AUDIO}", "").trim();

        // split morshutext into 900 char chunks
	}
}

checkForMorshus("Hello {MORSHUIFY_AUDIO} World!");