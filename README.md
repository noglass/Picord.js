# Picord.js
Minimalistic Discord bot ideal for controlling a Raspberry Pi remotely

# Idea
This bot is ideal for controlling a Raspberry Pi. It should only be in a private server with no one else but you (or anyone else that will be controlling the Pi).  
**There is absolutely no permission checking for commands and direct root shell access is available!**

# Commands
There are only five commands:
* `help` - Lists all commands and custom aliases.
* `uptime` - Displays the time of last Picord launch and how long it has been running.
* `exec <command ..>` - Executes shell commands.
* `restart` - Disconnects from Discord and exits. Combined with an autorestart system, will make the bot restart.
* `alias <alias> <command ..>` - The most useful command. Binds a shell command to a keyword command.

# Aliases
Aliases allow you to easily bind shell commands to simple, single word commands.  
With aliases, you can create countless new commands on the fly.  
`example-aliases.txt` is a basic example of a few aliases I use.  
If you use `motion`, you can configure it to run shell commands for certain events like detecting motion or saving a picture/video.  
Using webhooks, you can easily send messages from the shell like so:
```sh
notification='webhook url here'
function webhook_notify()
{
    curl -H "Content-Type: application/json" -X POST -d '{"embeds":[{"color":'"$1"',"title":"'"$2"'","description":"'"$3"'"}]}' "$notification"
}
function webhook_upload()
{
    curl -H "Content-Type: multipart/form-data" -X POST -F file1=@"$1" -F content="$2" "$notification"
}
```
Add this to your `.bashrc` file to use them.

# Example motion settings
```
on_event_start webhook_notify 25855 "Motion Detected!" "Motion has been detected, recording event #%v."
on_picture_save webhook_upload "%f" "Preview screenshot of event #%v."
```
