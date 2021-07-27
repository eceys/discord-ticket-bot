module.exports = {
    name: "tag",
    cooldown: 5,
    description: "Nickname changes in server.",
    permission: "MANAGE_NICKNAMES",
    guildOnly: true,
    execute(message, args, Embed, Discord) {

        const mentionedPlayer = message.mentions.members.first();

        if (!mentionedPlayer) return message.channel.send(Embed("", "Please, tag a user. ", "yellow"));

        
        const discordName = mentionedPlayer.user.username;
        const newNickname = args.splice(1, args.length-1).join(" ");
        if(!newNickname) return message.channel.send(Embed("", "Please, enter a valid nickname.", "yellow"));
        
        mentionedPlayer.setNickname(newNickname).then(() => {
            return message.channel.send(Embed("", `**${discordName}** new nickname --> **${newNickname}**`, "purple"));
        })
        .catch(() => {
            return message.channel.send(Embed("", `**${mentionedPlayer}** can not change nickname`, "red"));
        })
    }
}