const { SlashCommandBuilder } = require('@discordjs/builders')
const { CommandInteraction, Client, MessageEmbed } = require('discord.js')
const SETTINGS = require('../database/models/settingsSchema')

module.exports = {
    global: true,
    data: new SlashCommandBuilder()
        .setName('skullboard')
        .setDescription("Setup/Edit your server's SkullBoard!")
        .addSubcommand((cmd) => {
            return cmd
                .setName('toggle')
                .setDescription('Enable/Disable SkullBoard for your server!')
        })
        .addSubcommand((cmd) => {
            return cmd
                .setName('minimum-skulls')
                .setDescription(
                    'Amount of skull reactions a message needs to get on the SkullBoard!'
                )
                .addNumberOption((opt) => {
                    return opt
                        .setName('count')
                        .setDescription('Number of skulls.')
                        .setRequired(true)
                })
        })
        .addSubcommand((cmd) => {
            return cmd
                .setName('channel')
                .setDescription(
                    'The channel where the Skulled posts should be posted.'
                )
                .addChannelOption((opt) => {
                    return opt
                        .setName('channel')
                        .setDescription('Mention the channel.')
                        .setRequired(true)
                })
        })
        .addSubcommand((cmd) => {
            return cmd
                .setName('show')
                .setDescription("See your server's SkullBoard settings!")
        }),
    async execute(interaction, client) {
        if (!interaction.member.permissions.has('ADMINISTATOR'))
            return interaction.reply('You need to be an Admin to use this!')

        const data = {
            count: interaction.options.getNumber('count'),
            channel: interaction.options.getChannel('channel'),
        }
        const command = interaction.options.getSubCommand()
        let server = await SETTINGS.findOne({
            guildID: interaction.guild.id,
        })

        if (!server || !server?.skullboard) {
            server.skullBoard = {
                enabled: false,
                count: 5,
            }
            server.save()
        }
        if (command == 'show') {
            const embed = new MessageEmbed()
                .setTitle(`SkullBoard settings for ${interaction.guild.name}`)
                .setDescription(
                    `These settings can be changed by using */skullboard*!`
                )
                .addField(
                    'Status',
                    `SkullBoard for this server is currently ${
                        server.skullBoard.enabled
                            ? '**enabled**'
                            : '**disabled**'
                    }! You can toggle this via /skullboard toggle`
                )
                .addField(
                    'Reaction Threshold',
                    server.skullBoard.count.toString()
                )
                .addField(
                    'Redirect Channel',
                    `<#${server.skullBoard.channelId}>`
                )
                .setColor('GREEN')
                .setFooter({
                    text: 'z',
                })

            return interaction.reply({ embeds: [embed] })
        } else if (command == 'toggle') {
            server.skullBoard.enabled = server.skullBoard.enabled
                ? (server.skullBoard.enabled = false)
                : (server.skullBoard.enabled = true)

            server.save()
            return interaction.reply(
                `SkullBoard for this server is now ${
                    server.skullBoard.enabled ? '**enabled**' : '**disabled**'
                }!`
            )
        } else if (command == 'channel') {
            const channelid = interaction.options.getChannel('channel')

            try {
                client.channels.cache
                    .get(channelid.id)
                    .send('test')
                    .then((m) => {
                        m.delete()
                    })
            } catch (e) {
                return interaction.reply(
                    'An error occured! Make sure the channel you tagged is a text channel and I have the permissions to send messages there!\nError Code: ' +
                        e.message
                )
            }

            server.skullBoard.channelId = channelid.id
            server.save()
            return interaction.reply(
                `Embeds will now be redirected to ${channelid.toString()}`
            )
        } else if (command == 'minimum-skulls') {
            const count = interaction.options.getNumber('count')

            if (count > 50 || count < 3) {
                return interaction.reply(
                    'The minimum skull count should be a number between 3-50!'
                )
            }
            server.skullBoard.count = count
            server.save()

            interaction.reply(
                'Done! Any message with ' +
                    count.toString() +
                    ' :skull: reaction will be posted in ' +
                    '<#' +
                    server.channelId +
                    '>' +
                    '!'
            ) // this is the shittiest line of code i've written
        }
    },
}
