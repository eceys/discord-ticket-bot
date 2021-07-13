module.exports = {
    name: "ticketfix",
    cooldown: 3,
    aliases: ["tkfix"],
    description: "Ticket fix.",
    guildOnly: true,
    permission : ["ADMINISTRATOR"],
    async execute(message, args, Embed, Discord, Tags, tag){

        const data =  tag.get("ticketMessage");
        let cid;
        

        message.channel.send(Embed("Ticket Fix","Opened channels are **deleted.**\nAre you sure?","orange")).then(async (msg) => {
            await msg.react('👌🏼');
            data.fixMessage = msg.id;
            await Tags.update({ticketMessage : data} ,{where: {guildID : message.guild.id}});
        })

    }   
}