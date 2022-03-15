# babot
Admin bot for glorious trumpet land  
BABA IS ADMIN,   
HANK IS PROGRAMER,   
ADAM IS PROGRAMER,   
SAMI IS PROGRAMER,
SHANE IS PROGRAMMER,     
SERVER IS SERVER,   
JOKE IS OLD.  
  
## dependencies
node version 16.9.0  
dependencies included in package.json - just use
`npm install`

## running
`forever start babot.js`

## configuration
~setting up babotdata.json:  
{"token":bot token as string,  
"pass":response for password command as string,  
"adminid":admin id as string,  
"logchn":log chanel id as string,  
"temp":temp file location as string,  
"datalocation":location of data unpacked from FrogHolidays.zip as string,  
"emoji":server ban hammer emoji}  
  
## admin commands
!setvote <msg ID> : creates a vote with reactions on the message  
!bdelete <msg ID> : sends message to the deleted channel and removes the original  
!political <msg ID> : sends message to the politics channel<br>
!banhammer <msg ID> : baba adds an emoji from the babotdata.json file  
!grole <role name> <msg ID> : creates or adds people who react to message to role  
!bsetgame <optional activity type> <activity> : sets the game for baba

## user commands
to get user commands type !baba help (note only command  is !baba passwords at the moment)
