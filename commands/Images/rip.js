const Command = require("../../base/Command.js"),
Discord = require("discord.js");

class Rip extends Command {
    constructor (client) {
        super(client, {
            name: "rip",
            description: (language) => language.get("RIP_DESCRIPTION"),
            usage: (language) => language.get("RIP_USAGE"),
            examples: (language) => language.get("RIP_EXAMPLES"),
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
        let buffer = await this.client.AmeAPI.generate("rip", { url: user.displayAvatarURL({ format: "png", size: 512 }) });
        let attachment = new Discord.MessageAttachment(buffer, "rip.png");
        m.delete();
        message.channel.send(attachment);

    }

}

module.exports = Rip;