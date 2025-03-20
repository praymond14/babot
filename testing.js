const { babaUntilHolidays } = require("./commandFunctions");
const { LoadAllTheCache, StartDB } = require("./databaseVoiceController");

global.dbAccess = [!process.argv.includes("-db"), process.argv.includes("-db") ? false : true];

StartDB("Init");
LoadAllTheCache().then(() => {
    var evt = babaUntilHolidays("!baba wednesday christmas", { id: "360228104997961740" }, "04");
    console.log(evt);
});
