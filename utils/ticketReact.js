const database = require('./database');


module.exports = (client, Discord) =>{

    client.on('messageReactionAdd', async (reaction, user) => {

        const closeEmbed = new Discord.MessageEmbed()
            .setColor("#9326ff")
            .setTitle(`${user.username} Welcome`)
            .setDescription("Admin will be here.")
            .addField('\u200b', "You can close the ticket by click the emoji.", false)

        
        const closeEmbed2 = new Discord.MessageEmbed()
            .addField("\u200b",`<@${user.id}> Cloesed ticket.`,false)
            .addField("Delete channel?","\u200b",false)
            .setColor("#9326ff")
        
        const checkEmbed = new Discord.MessageEmbed()
            .setColor("#9326ff")
            .setDescription(`Are you sure close ticket?`)
        
        const secondEmbed = new Discord.MessageEmbed()
            .setColor("#9326ff")
            .setDescription(`Channel will be removed in 5 seconds.`)

        const fixEmbed = new Discord.MessageEmbed()
            .setColor("#4aff26")
            .setTitle("Data cleared successfully.")
            .addField("Setup:", "**just** .ticket active.",false)

        const limitEmbed = new Discord.MessageEmbed()
            .setColor("#9326ff")
            .setTitle("You've reached the ticket limit.")
            .setDescription("To open a new ticket, you must first close the existing one.")
            
        
        if(reaction.partial){
            await reaction.fetch();
        }

        if(user.bot) return;

        const Tags = database();
        const tag = await Tags.findOne({where : {guildID : reaction.message.guild.id}})
        const data =  tag.get("ticketMessage");


        if(reaction.emoji.name === '👌🏼'){
            if(reaction.message.id == data.fixMessage);
            await reaction.users.remove(user.id);
            if(!data.fixMessage) return;
            
            if(data.createdChannelID.length != 0){
                for(let a=0;a<data.createdChannelID.length;a++){
                    cid = "";
                    let arr = new Array();
                    arr = data.createdChannelID[a].split("//");
                    cid = arr[0];
                    const fetchedChannel = reaction.message.member.guild.channels.cache.get(`${cid}`);
                    if(fetchedChannel){
                        fetchedChannel.delete();
                    }
                    data.createdChannelID.splice(0,data.createdChannelID.length);
                }
                
                await Tags.update({ticketMessage : data} ,{where: {guildID : reaction.message.guild.id}});   
            }
            if(data.messageID != " "){
                reaction.message.client.channels.cache.get(data.channelID).messages.fetch(data.messageID).then(msg => msg.delete());
                data.messageID = " ";
                await Tags.update({ticketMessage : data} ,{where: {guildID : reaction.message.guild.id}});
            }


            if(data.fixMessage == reaction.message.id){
                data.enabled = false;
                await Tags.update({ticketMessage : data} , {where : {guildID : reaction.message.guild.id}});
                let away = data.member.length;
                await data.member.splice(0,away);
                await Tags.update({ticketMessage : data} , {where : {guildID : reaction.message.guild.id}});
                away = data.createdChannelID.length;
                await data.createdChannelID.splice(0,away);
                await Tags.update({ticketMessage : data} , {where : {guildID : reaction.message.guild.id}});
                data.ticketCount = 1;
                await Tags.update({ticketMessage : data} , {where : {guildID : reaction.message.guild.id}});
                }
                reaction.message.channel.send(fixEmbed); 
            }

        const checkActive = data.enabled;
        if(!checkActive) return;

        let seePermission = new Array();
        for(let a = 0; a< data.seeChannel.length ; a++){
            seePermission = data.seeChannel[a].slice(3,21);
        }
        
        if(reaction.message.id == data.messageID) {
            if (reaction.emoji.name === '🎫') {
                
                for(let a = 0;a <data.member.length;a++){
                    if(data.member[a] == user.id){
                        await reaction.users.remove(user.id);
                        user.send(limitEmbed);
                        return;
                    }
                }
                
                data.member.push(user.id);
                let channelName = data.ticketCount;
                
                
                
                await reaction.message.guild.channels.create(`${channelName} Ticket`, {
                    type:"text",
                    permissionOverwrites: [
                        {
                            id: user.id,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                        },
                        {
                            id: reaction.message.guild.roles.everyone,
                            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                        },
                        {
                            id : seePermission,
                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                        }
                        
                    ]
                }).then(async (channel) => {
                    let textRolesWelcome;
                    for(let a=0;a<data.seeChannel.length;a++){
                        let tempMsg;
                        tempMsg = data.seeChannel[a];
                        if(!textRolesWelcome){
                            textRolesWelcome = `${tempMsg}`;
                        }else{
                            textRolesWelcome = textRolesWelcome + ` ${tempMsg}`
                        }
                        
                    }
                   
                   channel.send(`<@${user.id}> ${textRolesWelcome}`);
                   channel.send(closeEmbed).then( async (msg) => {
                       await msg.react('📥');
                       let textAll = `${msg.channel.id}//${user.id}`
                       data.createdChannelID.push(textAll);
                       await Tags.update({ticketMessage : data} , {where : {guildID : reaction.message.guild.id}});
                   })
                })
                
                channelName = channelName + 1;
                data.ticketCount = channelName;
                await Tags.update({ticketMessage : data} , {where : {guildID : reaction.message.guild.id}});
                await reaction.users.remove(user.id);
            }
        }else if (reaction.emoji.name === '📥') {
            await reaction.users.remove(user.id);

            reaction.message.channel.send(checkEmbed).then( async (msg) =>{
                msg.react('✅')
                msg.react('❎')
            });

        }else if(reaction.emoji.name === '🆑'){
            await reaction.users.remove(user.id);
            for(let a=0;a<data.createdChannelID.length;a++){
                let arr = new Array();
                let channelText;
                channelText = data.createdChannelID[a];
                arr = channelText.split("//");
                if(reaction.message.channel.id == arr[0]){
                    
                    if(user.id == reaction.message.guild.ownerID || user.id != arr[1]){
                        let arr1 = new Array();
                        let channelText1;
                        channelText1 = data.createdChannelID[a];
                        arr1 = channelText1.split("//");
                        
                        for(let c=0;a<data.member.length;c++){
                            if(data.member[c] == arr[1]){
                                data.member.splice(c,1)
                                await Tags.update({ticketMessage : data} , {where : {guildID : reaction.message.guild.id}});
                            }
                        }
                        data.createdChannelID.splice(a,1);
                        await Tags.update({ticketMessage : data} , {where : {guildID : reaction.message.guild.id}});
                        await reaction.message.channel.send(secondEmbed);
                        setTimeout(() => {
                            reaction.message.channel.delete();
                        },5000)
                    }
                    else{
                        reaction.message.channel.overwritePermissions([
                            {
                                id: user.id,
                                deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                            },
                            {
                                id: reaction.message.guild.roles.everyone,
                                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                            },
                            {
                                id : seePermission,
                                deny: ['SEND_MESSAGES'],
                                allow: ['VIEW_CHANNEL']
                            }
                        ]);
                        for(let c=0;a<data.member.length;c++){
                            if(data.member[c] == user.id){
                                data.member.splice(c,1)
                                await Tags.update({ticketMessage : data} , {where : {guildID : reaction.message.guild.id}});
                            }
                        }
                    }
                    
                }
        }

        }else if(reaction.emoji.name === '✅'){
            await reaction.users.remove(user.id);
            
            for(let a=0;a<data.createdChannelID.length;a++){
                let arr = new Array();
                let channelText;
                channelText = data.createdChannelID[a];
                arr = channelText.split("//");
                if(reaction.message.channel.id == arr[0]){
                    
                    reaction.message.channel.overwritePermissions([
                        {
                            id: user.id,
                            deny: ['SEND_MESSAGES'],
                            allow: ['VIEW_CHANNEL']
                        },
                        {
                            id: reaction.message.guild.roles.everyone,
                            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                        },
                        {
                            id : seePermission,
                            deny: ['SEND_MESSAGES'],
                            allow: ['VIEW_CHANNEL']
                        }
                    ]);
                    
                }
            }
            
            reaction.message.channel.send(closeEmbed2).then((msg) => {
                msg.react("🆑");
                const channel = reaction.message.member.guild.channels.cache.get(`${reaction.message.channel.id}`);
                channel.setName(`${data.ticketCount-1} closed`);
            })
        }else if(reaction.emoji.name === '❎'){
            await reaction.users.remove(user.id);
        }
    });
}

