//Requires
const modulename = 'DiscordBot';
// old version DONT USE -> const Discord = require('@tabarra/discord');
const { dir, log, logOk, logWarn, logError } = require('../../extras/console')(modulename);
const Discord = require('discord.js');
const CronJob = require("cron").CronJob;


//NOTE: fix for the fact that fxserver (as of 2627) does not have URLSearchParams as part of the global scope
if (typeof URLSearchParams === 'undefined') {
    global.URLSearchParams = require('url').URLSearchParams;
}

//Helpers
const now = () => { return Math.round(Date.now() / 1000); };


module.exports = class DiscordBot {
    constructor(config) {
        super({
            partials: ['MESSAGE', 'CHANNEL', 'GUILD_MEMBER', 'USER'],
            ws: {
              intents: [
                  "GUILDS",
                  "GUILD_MEMBERS",
                  "GUILD_MESSAGES",
              ],
            },
          });
        this.config = config;
        this.announceChannel = null;
        this.latestMutex = null;
        this.usageStats = {
            addwl: 0,
            help: 0,
            status: 0,
            txadmin: 0,
        };

        //NOTE: setting them up statically due to webpack requirements


        // Old Version!
        /*this.commands = new Map([
            ['addwl', require('./commands/addwl.js')],
            ['help', require('./commands/help.js')],
            ['status', require('./commands/status.js')],
            ['txadmin', require('./commands/txadmin.js')],

            //FIXME: first we need to have player ids in the players db
            // ['info', require('./commands/info.js')],
        ]);*/



     
        this.commands = new Discord.Collection();
        this.slashCommands = new Discord.Collection();
        this.cooldowns = new Map();

        if (!this.config.enabled) {
            // logOk('Disabled by the config file.');
        } else {
            this.startBot();
        }
    }


    //================================================================
    /**
     * Refresh discordBot configurations
     */
    refreshConfig() {
        this.config = globals.configVault.getScoped('discordBot');
        if (this.client !== null) {
            logWarn('Stopping Discord Bot');
            this.client.destroy();
            setTimeout(() => {
                if (this.config.enabled == false) this.client = null;
            }, 1000);
        }
        if (this.config.enabled) {
            this.startBot();
        }
    }//Final refreshConfig()


    //================================================================
    /**
     * Send an announcement to the configured channel
     * @param {string} message
     */
    async sendAnnouncement(message) {
        if (
            !this.config.announceChannel
            || !this.isReady()
            || !this.announceChannel
        ) {
            if (GlobalData.verbose) logWarn('returning false, not ready yet', 'sendAnnouncement');
            return false;
        }

        try {
            this.announceChannel.send(message);
        } catch (error) {
            logError(`Error sending Discord announcement: ${error.message}`);
        }
    }//Final sendAnnouncement()


    //================================================================
    /**
     * Starts the discord client
     */
    async startBot() {
        //State check
        if (this.isReady()) {
            logWarn('Client not yet destroyed, awaiting destruction.');
            await this.destroy();
        }

        //Set mutex to prevent spamming /help on reconnections
        const currentMutex = Math.random();

        // Need this to find the commands
        const { glob } = require("glob");
        const { promisify } = require("util");
        const globPromise = promisify(glob);


        // Commands
        const commandFiles = await globPromise(`${process.cwd()}/commands/*.js`);
        commandFiles.map((value) => {
            const file = require(value);
            const splitted = value.split("/");
            const directory = splitted[splitted.length - 2];

            if (file.name) {
                const properties = { directory, ...file };
                this.commands.set(file.name, properties);
            }
        });

        // Slash Commands
        const slashCommands = await globPromise(
            `${process.cwd()}/commands/*.js`
        );

        const arrayOfSlashCommands = [];
        slashCommands.map((value) => {
            const file = require(value);
            if (!file?.name) return;
            this.slashCommands.set(file.name, file);

            arrayOfSlashCommands.push(file);
        });






        //Setup Ready listener
        this.on('ready', async () => {
            logOk(`Started and logged in as '${this.user.tag}'`);

            await this.application.commands.set(arrayOfSlashCommands);
            logOk(`Done with SlashCommand registration!`);

            this.user.setPresence({ activities: [{ name: globals.config.serverName, type: "WATCHING" }], status: 'online'});
            this.announceChannel = this.channels.cache.find((x) => x.id === this.config.announceChannel);
            if (!this.announceChannel) {
                logError(`The announcements channel could not be found. Check the channel ID ${this.config.announceChannel}, or the bot permissions.`);
            } else if (currentMutex !== this.latestMutex) {
                let cmdDescs = [];
                this.commands.forEach((cmd, name) => {
                    cmdDescs.push(`${this.config.prefix}${name}: ${cmd.description}`);
                });
                const descLines = [
                    `:rocket: **txAdmin** v${GlobalData.txAdminVersion} bot started!`,
                    ':game_die: **Commands:**',
                    '```',
                    ...cmdDescs,
                    '...more commands to come soon 😮',
                    '```',
                ];
                const msg = new Discord.MessageEmbed().setColor(0x4287F5).setDescription(descLines.join('\n'))

                this.announceChannel.send({embed: msg});
                this.latestMutex = currentMutex;
            }
        });

        
        //Setup remaining event listeners
        this.on('messageCreate', this.handleMessage.bind(this));
        this.on('interactionCreate', this.handleInteraction.bind(this));
        this.on('error', (error) => {
            logError(`Error from Discord.js client: ${error.message}`);
        });
        new CronJob("0 * * * *", async function() {
          // set the Activity
          this.user.setPresence({ activities: [{ name: globals.config.serverName, type: "WATCHING" }], status: 'online'});
        
          }, null, true, "Europe/Berlin");




        //Start bot
        try {
            await this.login(this.config.token);
        } catch (error) {
            logError(`Discord login failed with error: ${error.message}`);
            //TODO: colocar aqui mensagem de erro pra aparecer no dashboard
        }
    }

    //================================================================
    async handleMessage(message) {
        //Ignoring bots and DMs
        if (message.author.bot) return;
        if (interaction.channel.type !== 'GUILD_TEXT') return;
        if (!message.content.startsWith(this.config.prefix)) return;
        if(!this.isReady()) return;



        //Parse message
        const args = message.content.slice(this.config.prefix.length).split(/\s+/);
        const commandName = args.shift().toLowerCase();

        //Check if its a recognized command
        const command = this.commands.get(commandName)
                        || this.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return;

        //Check spam limiter
        if (!this.cooldowns.has(commandName)) {
            this.cooldowns.set(commandName, now());
        } else {
            const cooldownTime = command.cooldown || 30;
            const expirationTime = this.cooldowns.get(commandName) + cooldownTime;
            const ts = now();
            if (ts < expirationTime) {
                const timeLeft = expirationTime - ts;
                if (GlobalData.verbose) log(`Spam prevented for command "${commandName}".`);
                return message.reply({content: `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${commandName}\` command again.`});
            }
        }

        //Increment usage stats
        this.usageStats[commandName] = (typeof this.usageStats[commandName] == 'undefined') ? 1 : this.usageStats[commandName] + 1;

        //Executing command
        try {
            await command.execute(message, args);
        } catch (error) {
            logError(`Failed to execute ${commandName}: ${error.message}`);
        }
    }

    async handleInteraction(interaction) {
        //Ignoring bots and DMs
        if (interaction.channel.type !== 'GUILD_TEXT') return;
        if(!this.isReady()) return;


        //Parse message
        const args = interaction.content.slice(this.config.prefix.length).split(/\s+/);
        const commandName = args.shift().toLowerCase();

        //Check if its a recognized command
        const command = this.commands.get(commandName)
                        || this.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return;

        //Check spam limiter
        if (!this.cooldowns.has(commandName)) {
            this.cooldowns.set(commandName, now());
        } else {
            const cooldownTime = command.cooldown || 30;
            const expirationTime = this.cooldowns.get(commandName) + cooldownTime;
            const ts = now();
            if (ts < expirationTime) {
                const timeLeft = expirationTime - ts;
                if (GlobalData.verbose) log(`Spam prevented for command "${commandName}".`);
                return interaction.reply({content: `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${commandName}\` command again.`});
            }
        }

        //Increment usage stats
        this.usageStats[commandName] = (typeof this.usageStats[commandName] == 'undefined') ? 1 : this.usageStats[commandName] + 1;

        //Executing command
        try {
            await command.execute(interaction, args);
        } catch (error) {
            logError(`Failed to execute ${commandName}: ${error.message}`);
        }
    }
}; 
