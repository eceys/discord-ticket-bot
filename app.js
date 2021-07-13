const Discord = require('discord.js');
const client = new Discord.Client({partials : ["MESSAGE","REACTION"]});

const disbut = require('discord-buttons'); //discord buttons

//token ve prefix okuma
const { token, prefix, developerID } = require("./config.json");

//utils
const Embed = require('./utils/embed.js');
const database = require('./utils/database.js');
const ticketReact = require('./utils/ticketReact');


//database
const Tags = database();



ticketReact(client,Discord);


//read file
const fs = require('fs');
const { permission } = require('./commands/tag');
const { parse } = require('path');

//commands collection
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();


//commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commandFiles.forEach(file => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
})

client.once('ready', async () => {
    console.log("Bot Ready!");
    client.user.setActivity("i am ready");

    //database
    Tags.sync();

    //Database add check
    const servers = [];
    client.guilds.cache.forEach(async guild => {
        servers.push(guild.id);
        const tag = await Tags.findOne({ where: { guildID: guild.id } });
        if( tag == null){
            await Tags.create({guildID : guild.id})
        }
    });

    //Database remove check
    await Tags.findAll().then(gList => {
        gList.forEach(async guildDB => {
            const dbID = guildDB.dataValues.guildID;
            if(!servers.includes(dbID)){
                await Tags.destroy({where: {guildID: dbID}})
            }
        })
    })
    
})

client.on("guildCreate", async (guild) => {
    await Tags.create({guildID : guild.id})
})


client.on("message", async (message) => {

    if (message.author.bot) return;

    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));


    if (!message.content.startsWith(prefix) || !command) return;

    //guild control
    if (command.guildOnly && message.channel.type == "dm") return message.channel.send(Embed("", "Bu komut dm'de kullanılamaz.", "red")); //mesaj dmden atılmışsa

    //permission kontrol
    if (command.permission && !message.member.hasPermission(command.permission)) return message.channel.send(Embed("", "Bu komutu kullanmaya yetkin yok!", "red"));

    if (command.developerOnly && message.author.id != developerID) return;

    //cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const timestamps = cooldowns.get(command.name);
    const now = Date.now();
    const coolDownAmount = (command.cooldown || 5) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + coolDownAmount;
        if (expirationTime > now) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.channel.send(Embed("", `Has cooldown **${parseInt(timeLeft)} seconds** .`, "yellow"));
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => {
        timestamps.delete(message.author.id);
    }, coolDownAmount);

    //where tag
    const tag = await Tags.findOne({where : {guildID : message.guild.id}})

    try {
        command.execute(message, args, Embed, Discord, Tags, tag);
    } catch (e) {
        console.error(e);
        message.channel.send("Something went wrong.");
    }
    const mentionedMember = message.mentions.members.first();

    
})

client.login(token);