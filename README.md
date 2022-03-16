# babot
Admin bot for glorious trumpet land  
BABA IS ADMIN,   
HANK IS PROGRAMER,   
ADAM IS PROGRAMER,   
SAMI IS PROGRAMER,
SHANE IS PROGRAMMER,     
SERVER IS SERVER,   
JOKE IS OLD.  

# Setup

## start
- extract Data.zip (in place, creating `baba/Data/`)
- create babotdata.json (from template: `cp babotdata.template.json babotdata.json`)
    - see next section for configuration

## configuration
~setting up babotdata.json:  
{"token": bot token as string,  
"pass": response for password command as string,  
"datalocation": location of data unpacked from FrogHolidays.zip as string,  
"adminid": admin role ID as string,  
"logchn": log channel ID as string,  
"politicschan": politics channel ID as string,  
"holidaychan": leave as "0" - will be auto-filled,  
"holidayval": leave as "null" - will be auto-filled,
"temp": temp file location as string,  
"emoji":server ban hammer emoji ID as string}  

## dependencies
node version 16.9.0  
dependencies included in package.json - just use
`npm install`

## running
`node babot.js`  
or  
`forever start babot.js`
(requires forever: `npm install forever -g`)
  
# Use

## admin commands
!setvote <msg ID> : creates a vote with reactions on the message  
!bdelete <msg ID> : sends message to the deleted channel and removes the original  
!political <msg ID> : sends message to the politics channel<br>
!banhammer <msg ID> : baba adds an emoji from the babotdata.json file  
!grole <role name> <msg ID> : creates or adds people who react to message to role  
!bsetgame <optional activity type> <activity> : sets the game for baba

## user commands
to get user commands type !baba help (note only command  is !baba passwords at the moment)
