module.exports = {
    name: "ticket",
    cooldown: 2,
    aliases: ["tk"],
    description: "Setup ticket.",
    guildOnly: true,
    permission: ["ADMINISTRATOR"],
    async execute(message, args, Embed, Discord, Tags, tag){

        const data =  tag.get("ticketMessage");

        if(args[0] == "channel"){
            const mentionedChannel = message.mentions.channels.first();
            if(!mentionedChannel) return message.channel.send(Embed("", "Please, tag a channel.", "yellow"));

            data.channelID = mentionedChannel.id;
            await Tags.update({ticketMessage : data} ,{where: {guildID : message.guild.id}});

            return message.channel.send(Embed("", "Successfully added channel." , "green"));

            
        }else if(args[0] == "message"){
            const text = args.splice(1, args.length-1).join(" ");
            if(!text) return message.channel.send(Embed("", "Please, add explaine message.","yellow"));
            
            data.message = text;
            await Tags.update({ticketMessage : data} ,{where: {guildID : message.guild.id}});

            return message.channel.send(Embed("", "Successfully added message." , "green"));
        }else if(args[0] == "on"){

            const checkEnabled = data.enabled;
            if(checkEnabled) return message.channel.send(Embed("", "Ticket already active.", "purple"));
            
            const checkChannel = data.channelID;
            const checkMessage = data.message;
            const checkTitle = data.title;
            const checkRoles = data.seeChannel.length;

            if(checkChannel==" " || checkMessage==" " || checkTitle==" "|| checkRoles==0) return message.channel.send(Embed("", "Please, setup ticket bot.\nWrite a **.ticket** for clarification.", "yellow"));
            
            data.enabled = true;
            await Tags.update({ticketMessage : data} , {where : {guildID : message.guild.id}});

            const ticketEmbed = new Discord.MessageEmbed()
                .setColor("#9326ff")
                .setTitle(`${checkTitle}`)
                .setDescription(`${checkMessage}`)
                .setFooter('Added bot.')
                
            if(data.messageID == " "){
                const textChannel = message.guild.channels.cache.get(`${checkChannel}`);
                if(!textChannel) return;
                textChannel.send(ticketEmbed).then(async (msg) => {
                    await msg.react('🎫');
                    data.messageID = msg.id;
                    await Tags.update({ticketMessage : data} , {where : {guildID : message.guild.id}});
                })
            }
            

            message.channel.send(Embed("", "Ticket active", "purple"));
            
        }else if(args[0] == "off"){
            
            data.enabled = false;
            await Tags.update({ticketMessage : data} ,{where: {guildID : message.guild.id}});

            return message.channel.send(Embed("", "Ticket message off!", "red"));
        }else if(args[0] == "headline"){
            const text = args.splice(1, args.length-1).join(" ");
            if(!text) return message.channel.send(Embed("", "Please, add headline.","yellow"));
            
            data.title = text;
            await Tags.update({ticketMessage : data} ,{where: {guildID : message.guild.id}});

            return message.channel.send(Embed("", "Successfully headline added." , "green"));
        }else if(args[0] == "admin" || args[0] == "mod"){
            
            let roles = new Array();
            let checkEnrty = 0;
            let checkSomeID = 0;

            for(let a=1;a<args.length;a++){
                checkSomeID = 0;
                if(args[a].startsWith("<@&")){
                        for(let b=0;b<data.seeChannel.length;b++){
                            if(args[a] == data.seeChannel[b]){
                                checkSomeID = 1;
                                break;
                            }  
                        }
                        if(checkSomeID == 0){
                            data.seeChannel.push(args[a]);
                            roles.push(args[a]);
                            await Tags.update({ticketMessage : data} ,{where: {guildID : message.guild.id}});
                        }      
                }else{
                    checkEnrty++;
                }
            }

            if(checkEnrty != 0){
                return message.channel.send(Embed("", `${roles}\nsuccessfully added.\nExisting ones are not added.\n
                No other tags selected.`, "green"));
            }else{
                return message.channel.send(Embed("", `${roles}\nsuccessfully added.\nExisting ones are not added.`, "green"));
            }
            
            
        }else if(args[0] == "removeadmin" || args[0] == "remadmin" || args[0] == "remmod"){
            let roles = new Array();
            let checkEnrty = 0;
            if(data.seeChannel.length == 0) return message.channel.send(Embed("","Please add roles first.", "yellow"));
            if(args.length-1 == 0) return message.channel.send(Embed("","Please tag a role.","yellow"));
            for(let a=1;a<args.length;a++){
                if(args[a].startsWith("<@&")){
                        for(let b=0;b<data.seeChannel.length;b++){
                            if(args[a] == data.seeChannel[b]){
                                roles.push(args[a]);
                                data.seeChannel.splice(a,1);
                                await Tags.update({ticketMessage : data} ,{where: {guildID : message.guild.id}});
                            }  
                        }
                            
                }else{
                    checkEnrty++;
                }
            }

            if(checkEnrty != 0){
                return message.channel.send(Embed("", `${roles}\nsuccesfully removed.\nNo other tags selected.`, "green"));
            }else{
                return message.channel.send(Embed("", `${roles}\nsuccesfully removed`, "green"));
            }
            
        }else if(args[0] == "haveadmin" || args[0] == "hadmin"){
            if(data.seeChannel.length == 0) return message.channel.send(Embed("","There is no admin.", "yellow"));
            let arr = new Array();
            for(let a=0;a<data.seeChannel.length;a++){
                arr.push(data.seeChannel[a]);
            }

            return message.channel.send(Embed("Those with admin roles:",`${arr.join(" ")}`,"purple"));

        }
        else {
            const usageEmbed = new Discord.MessageEmbed()
            .setColor("#9326ff")    
            .setTitle("🎫 .ticket (.tk) guide;")
            .setDescription(".ticket channel #channel\n.ticket headline {headline}\n.ticket message {message}\n.ticket admin @role")
            .addField("\u200b","\u200b",false)
            .addField("◘ #channel", "Tag a valid channel.\nticket message appears on the added channel.",false)
            .addField("◘ {headline}","Ticket message headline.",false)
            .addField("◘ {message}", "Ticket message.",false)
            .addField("◘ @role", "added roles can see opened ticket channels.",true)
            .addField("◘ Those with admin roles", ".ticket hadmin", false)
            .addField("◘ .ticket removeadmin @role", "Deletes those with the admin role.",true)
            .addField("◘ To activate a ticket" ,".ticket on", false)
            .addField("◘ To deactive a ticket", ".ticket off", false)
            .addField("◘ Ticket Fix","You can use ticketfix for any error.",false)
            .setFooter("ticket ceys bot version 1.4")
            message.channel.send(usageEmbed);
        }
    }
}