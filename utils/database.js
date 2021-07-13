module.exports = () => {

    const Sequelize = require('sequelize');

    const sequelize = new Sequelize('database', 'user', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: 'database.sqlite'
    })

    const Tags = sequelize.define('tags', {
        guildID: { type: Sequelize.STRING, unique: true, allowNull: false },
        ticketMessage: { type: Sequelize.JSON, defaultValue: { enabled: false, channelID: " ", title: " ", message: " ", messageID: " ", fixMessage: " ", ticketCount: 1, seeChannel: [], createdChannelID: [], member: [] } },
        
    })

    return Tags;
}