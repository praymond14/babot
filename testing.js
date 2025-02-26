const { HaikuSelection } = require("./databaseandvoice");
const { LoadAllTheCache, StartDB } = require("./databaseVoiceController");

global.dbAccess = [!process.argv.includes("-db"), process.argv.includes("-db") ? false : true];

StartDB("Init");
LoadAllTheCache().then(() => {
    var h = HaikuSelection("", 6);
    console.log(h);
});
