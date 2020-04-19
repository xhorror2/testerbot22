const Command = require("../../base/Command.js"),
Discord = require("discord.js");

class Welcome extends Command {

    constructor (client) {
        super(client, {
            name: "welcome",
            description: (language) => language.get("WELCOME_DESCRIPTION"),
            usage: (language) => language.get("WELCOME_USAGE"),
            examples: (language) => language.get("WELCOME_EXAMPLES"),
            dirname: __dirname,
            enabled: true,
            guildOnly: true,
            aliases: [ "bienvenue" ],
            memberPermissions: [ "MANAGE_GUILD" ],
            botPermissions: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            nsfw: false,
            ownerOnly: false,
            cooldown: 3000
        });
    }

    async run (message, args, data) {

        if(args[0] === "test" && data.guild.plugins.welcome.enabled){
            message.client.emit("guildMemberAdd", message.member);
            return message.channel.send(message.language.get("WELCOME_TEST_SUCCESS"));
        }

        if(data.guild.plugins.welcome.enabled){
            data.guild.plugins.welcome = {
                enabled: false,
                message: null,
                channel: null,
                withImage: null
            };
            data.guild.markModified("plugins.welcome");
            data.guild.save();
            return message.channel.send(message.language.get("WELCOME_DISABLED", data.guild.prefix));
        }

        let welcome = {
            enabled: true,
            channel: null,
            message: null,
            withImage: null,
        };

        message.channel.send(message.language.get("WELCOME_FORM_CHANNEL", message.author.username));
        const collector = message.channel.createMessageCollector((m) => m.author.id === message.author.id, { time: 120000 }); // 2 min

        collector.on("collect", async (msg) => {

            if(welcome.message){
                if(msg.content.toLowerCase() === message.language.get("UTILS").YES.toLowerCase()){
                    welcome.withImage = true;
                    message.channel.send(message.language.get("WELCOME_FORM_SUCCESS", welcome.channel, data.guild.prefix));
                    data.guild.plugins.welcome = welcome;
                    data.guild.markModified("plugins.welcome");
                    await data.guild.save();
                    return collector.stop();
                }
                if(msg.content.toLowerCase() === message.language.get("UTILS").NO.toLowerCase()){
                    welcome.withImage = false;
                    message.channel.send(message.language.get("WELCOME_FORM_SUCCESS", welcome.channel, data.guild.prefix));
                    data.guild.plugins.welcome = welcome;
                    data.guild.markModified("plugins.welcome");
                    await data.guild.save();
                    return collector.stop();
                }
                return message.channel.send(message.language.get("ERR_YES_NO"));
            }

            if(welcome.channel && !welcome.message){
                if(msg.content.length < 1501){
                    welcome.message = msg.content;
                    return message.channel.send(message.language.get("WELCOME_FORM_IMAGE"));
                }
                return message.channel.send(message.language.get("WELCOME_ERR_CARACT"));
            }

            if(!welcome.channel){
                let channel = msg.mentions.channels.filter((ch) => ch.type === "text" && ch.guild.id === message.guild.id).first();
                if(!channel){
                    return message.channel.send(message.language.get("ERR_INVALID_CHANNEL"));
                }
                if(channel.guild !== msg.guild){
                    return;
                }
                welcome.channel = channel.id;
                message.channel.send(message.language.get("WELCOME_FORM_MESSAGE", channel, message));
            }

        });

        // When the collector is stopped
        collector.on("end", (collected, reason) => {
            if(reason === "time"){
                return message.channel.send(message.language.get("WELCOME_ERR_TIMEOUT"));
            }
        });
    }

}

module.exports = Welcome;
