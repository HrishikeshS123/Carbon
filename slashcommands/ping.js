const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check my round trip and Discord websocket latency.'),
    category: 'Utility',
    async execute(interaction) {
        const { client } = interaction;

        try {
            await interaction.reply({ content: 'Pinging...' });
            
            const embed = new MessageEmbed()
                .addFields(
                    { name: 'Discord WebSocket', value: `${client.ws.ping.toLocalString()}ms` },
                    { name: 'Round Trip', value: `${(Date.now() - interaction.createdTimestamp).toLocaleString()}ms` },
                )
                .setFooter({ text: client.user.tag, iconURL: client.user.displayAvatarURL({ dynamic: true }) ?? interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            
            await interaction.editReply({ content: '🏓 Pong!', embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    },
};
