const Command = require("../../base/Command.js"),
Discord = require("discord.js");

class Play extends Command {

    constructor (client) {
        super(client, {
            name: "play",
            description: (language) => language.get("PLAY_DESCRIPTION"),
            usage: (language) => language.get("PLAY_USAGE"),
            examples: (language) => language.get("PLAY_EXAMPLES"),
            dirname: __dirname,
            enabled: true,
            guildOnly: true,
            aliases: [ "joue" ],
            memberPermissions: [],
            botPermissions: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            nsfw: false,
            ownerOnly: false,
            cooldown: 5000
        });
    }

    async run (message, args, data) {

        if(!data.config.apiKeys.simpleYoutube || data.config.apiKeys.simpleYoutube.length == ""){
            return message.channel.send(message.language.get("ERR_COMMAND_DISABLED"));
        }

        let isPlaying = this.client.player.isPlaying(message.guild.id);

        let name = args.join(" ");
        if(!name){
            return message.channel.send(message.language.get("PLAY_ERR_NO_NAME"));
        } 

        let url = args[0].replace(/<(.+)>/g, "$1");

        let voice = message.member.voice.channel;
        if(!voice){
            return message.channel.send(message.language.get("PLAY_ERR_VOICE_CHANNEL"));
        }

        // Check my permissions
        let perms = voice.permissionsFor(message.client.user);
        if(!perms.has("CONNECT") || !perms.has("SPEAK")){
            return message.channel.send(message.language.get("PLAY_ERR_PERMS"));
        }

        let youtube = this.client.player.SYA;
        let video = null;

        video = await youtube.getVideo(url).catch((err) => {});

        if(!video){
            try {
                let videos = await youtube.searchVideos(name, 7);
                let i = 0;
                let embed = new Discord.MessageEmbed()
                    .addField(message.language.get("PLAY_HEADINGS")[3], videos.map((v) => `**${++i} -** ${v.title}`).join("\n")+"\n\n\n"+message.language.get("PLAY_SEARCH"))
                    .setColor(data.config.embed.color)
                    .setFooter(data.config.embed.footer);
                message.channel.send(embed);
                await message.channel.awaitMessages((m) => m.content > 0 && m.content < 8, { max: 1, time: 20000, errors: ["time"] }).then(async (answers) => {
                    let index = parseInt(answers.first().content, 10);
                    video = await youtube.getVideoByID(videos[index-1].id);
                    video = url;
                }).catch((e) => {
                    console.log(e);
                    return message.channel.send(message.language.get("PLAY_ERR_TIMEOUT"));
                });
            } catch(e){
                console.log(e);
                return message.channel.send(message.language.get("PLAY_ERR_NOT_FOUND"));
            }
        }

        if(video){
            if(isPlaying){
                let song = await this.client.player.addToQueue(message.guild.id, video);
                message.channel.send(message.language.get("PLAY_ADDED_TO_QUEUE", song));
            } else {
                let song = await this.client.player.play(voice, video);
                song.queue.on("end", () => {
                    message.channel.send(message.language.get("PLAY_ERR_NO_SONG"));
                })
                .on("songChanged", (oldSong, newSong) => {
                    message.channel.send(message.language.get("PLAY_SUCCESS", newSong));
                });
                message.channel.send(message.language.get("PLAY_SUCCESS", song));
            }
        } else {
            return message.channel.send(message.language.get("PLAY_ERR_NOT_FOUND"));
        }
    }

}

module.exports = Play; 