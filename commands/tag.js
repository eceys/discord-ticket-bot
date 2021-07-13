module.exports = {
    name: "tag",
    cooldown: 5,
    category: "yonetimGenel",
    description: "Sunucudaki üyelerin nicknameni değiştirir.",
    permission: "MANAGE_NICKNAMES",
    guildOnly: true,
    execute(message, args, Embed, Discord) {

        const mentionedPlayer = message.mentions.members.first();

        if (!mentionedPlayer) return message.channel.send(Embed("", "Lütfen bir kullanıcı etiketleyiniz. ", "yellow"));

        
        const discordName = mentionedPlayer.user.username;
        const newNickname = args.splice(1, args.length-1).join(" ");
        if(!newNickname) return message.channel.send(Embed("", "Lütfen geçerli bir nickname giriniz.", "yellow"));
        
        mentionedPlayer.setNickname(newNickname).then(() => {
            return message.channel.send(Embed("", `**${discordName}** kişisinin yeni adı **${newNickname}**`, "purple"));
        })
        .catch(() => {
            return message.channel.send(Embed("", `**${mentionedPlayer}** kişisinin adını değiştirmeye yetkim yok`, "red"));
        })
    }
}