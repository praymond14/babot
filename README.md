# babot
Admin bot for glorious trumpet land  
BABA IS ADMIN,   
HANK IS MANAGER,   
ADAM IS PROGRAMER,   
SAMI IS PROGRAMER,  
SHANE IS PROGRAMMER,  
SERVER IS SERVER,   
JOKE IS OLD.  

# Setup

## Start
- extract Data.zip (in place, creating `baba/Data/`)
- create babotdata.json (from template: `cp babotdata.template.json babotdata.json`)
    - see next section for configuration

## Configuration
### Setting up babotdata.json:  
```json
{
    "token": bot token as string,  
    "pass": response for password command as string,  
    "datalocation": location of data unpacked from FrogHolidays.zip as string,  
    "adminid": admin role ID as string,  
    "logchn": log channel ID as string,  
    "politicschan": politics channel ID as string,  
    "holidaychan": leave as "0" - will be auto-filled,  
    "holidayval": leave as "null" - will be auto-filled,  
    "temp": temp file location as string,  
    "emoji": server ban hammer emoji ID as string,
    "clientId": bot apllication id as string,
    "guildId": server guild id as string,
    "database": 
    {
        "host": database host,
        "user": database user,
        "password": database password,
        "database": database that is used,
        "port": port of the database
    }
}  
```

## Dependencies
node version 16.9.0  
dependencies included in package.json - just use
`npm install`

## Installing from scratch
A linux system is recommended. Production uses WSL1 on Win10.  
This guide installs nvm (Node Version Manager), node, and forever.

- `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash`
- reload terminal or `source ~/.bashrc` (on bash)
- `nvm install 16.9.0`
- `npm install forever -g`
- `git clone https://github.com/Aconka/babot.git`
- `cd babot`
- `npm install`
- configure babotdata.json
- `forever start babot.js`

## Running
`node babot.js`  
or  
`forever start babot.js`
(requires forever: `npm install forever -g`)
  
# Use

## Admin Commands
!setvote <msg ID> : creates a vote with reactions on the message  
!bdelete <msg ID> : sends message to the deleted channel and removes the original  
!political <msg ID> : sends message to the politics channel<br>
!banhammer <msg ID> : baba adds an emoji from the babotdata.json file  
!grole <role name> <msg ID> : creates or adds people who react to message to role  
!bsetgame <optional activity type> <activity> : sets the game for baba

## User Commands
to get user commands type !baba help (note only command  is !baba passwords at the moment)
