// Set this to the full path to the directory where you have your config files
//   (This is usually the directory that contains this file)
var PICORD_PATH = '/home/pi/node/';

const Discord = require('discord.js');
const execSync = require("child_process").execSync;
const fs = require('fs');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Connection successful!');
});

var startTime = Math.floor(Date.now() / 1000);
var startStr = (new Date()).toString() + ' ';

var commands = {
    "help": cmdHelp,
    "uptime": cmdBotUptime,
    "exec": cmdExec,
    "restart": cmdQuit,
    "alias": cmdAlias
};

// List all commands and aliases
function cmdHelp(message, args)
{
    var output = 'Command/Alias list:';
    for (cmd of Object.keys(commands))
        output += "\n" + cmd;
    message.channel.send(output);
}

// Time since picord was started
function cmdBotUptime(message, args)
{
    var s = Math.floor(Date.now() / 1000) - startTime;
    var m = Math.floor(s / 60) % 60;
    var h = Math.floor(s / 3600) % 24;
    var d = Math.floor(s / 86400) %  7;
    var w = Math.floor(s / 604800);
    message.channel.send(startStr + (w > 0 ? w + 'w ' : '') + (d > 0 ? d + 'd ' : '') + (h > 0 ? h + 'h ' : '') + (m > 0 ? m + 'm ' : '') + s%60 + 's');
}

// Executes shell commands, responds with stdout/stderr
function cmdExec(message, args)
{
    args.shift();
    console.log('$ ' + args.join(' '));
    try
    {
        var out = execSync(args.join(' ')).toString('utf-8');
        if (out.length > 0)
            message.channel.send(out);
        else
            message.react('✅');
        } catch(err) {
            if (err.message.length > 0)
                message.channel.send(err.message);
            else
                message.react('❌');
    }
}

// Logs off and quits. If set to autorestart, will cause a reload of the bot and all configs
function cmdQuit(message, args)
{
    message.channel.send("Goodbye!").then(() => {
        client.destroy();
        console.log('Exiting . . .');
    });
}

// Assign a shell command to an alias
//   When calling an alias, you can provide extra arguments
//   and they will be added to the end of the command.
function cmdAlias(message, args)
{
    var cmd = args.shift();
    if (args.length < 2)
    {
        if (message !== null)
            message.channel.send('Usage: ' + cmd + ' <alias> <command ...>');
        else
            console.log('Invalid alias: ' + args.join(' '));
    }
    else
    {
        commands[args[0]] = (m,a) => {
            a.shift();
            cmdExec(m,args.concat(a));
        };
        if (message !== null)
        {
            message.react('✅');
            fs.appendFileSync(PICORD_PATH + 'aliases.txt','alias ' + args.join(' ') + "\n");
        }
    }
}

fs.readFile(PICORD_PATH + 'picord.token', 'utf8', (err,data) => {
    if (!err)
    {
        console.log('Logging in to Discord . . .');
        client.login(data.split("\n")[0]);
    }
});

fs.readFile(PICORD_PATH + 'aliases.txt', 'utf8', (err,data) => {
    if (!err)
    {
        console.log('Loading aliases.txt: ');
        for (x of data.split("\n"))
        {
            if (x.length == 0)
                continue;
            console.log("\t" + x);
            cmdAlias(null,x.split(' '));
        }
    }
});

client.on('message', message => {
    console.log('[#' + message.channel.name + '] (' + message.author.username + '): ' + message.content);
    if (message.author.id !== client.user.id)
    {
        var args = message.content.split(' ');
        var cmd = args[0].toLowerCase();
        if (cmd in commands)
            commands[cmd](message,args);
    }
});

