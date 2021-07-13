const Discord = require('discord.js');

module.exports = (title, description, color = "#9326ff") => {
    const Embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(description)

        let newColor = "";
        if(color == "red") newColor = "#d90000";
        if(color == "green") newColor = "#4aff26";
        if(color == "blue") newColor = "#007bd9";
        if(color == "yellow") newColor = "#e5ff00"; 
        if(color == "orange") newColor = "#ffbe26";
        if(color == "purple") newColor = "#9326ff";

        if(newColor == "") Embed.setColor(color)
        else Embed.setColor(newColor);
    return Embed;
}
