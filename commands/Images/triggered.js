const Command = require("../../base/Command.js"),
Discord = require("discord.js");

class Triggered extends Command {
    constructor (client) {
        super(client, {
            name: "triggered",
            description: (language) => language.get("TRIGGERED_DESCRIPTION"),
            usage: (language) => language.get("TRIGGERED_USAGE"),
            examples: (language) => language.get("TRIGGERED_EXAMPLES"),
            dirname: __dirname,
            enabled: true,
            guildOnly: false,
            aliases: [],
            memberPermissions: [],
            botPermissions: [ "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES" ],
            nsfw: false,
            ownerOnly: false,
            cooldown: 5000
        });
    }

    async run (message, args, data) {

        let user = await this.client.resolveUser(args[0]) || message.author;
        let m = await message.channel.send(message.language.get("UTILS").PLEASE_WAIT);
        let buffer = await this.client.AmeAPI.generate("triggered", { url: user.displayAvatarURL({ format: "png", size: 512 }), sepia: "true", invert: "true" });
        let attachment = new Discord.MessageAttachment(buffer, "triggered.gif");
        m.delete();
        message.channel.send(attachment);

    }

}

module.exports = Triggered;