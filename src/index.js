require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder, ActivityType, Events, SlashCommandBuilder, User} = require('discord.js');
const config = require('../config.json');
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessages
        
    ]
});

client.once(Events.ClientReady, (ready) => {
  const socials = new SlashCommandBuilder()
    .setName("socials")
    .setDescription(`Link to all of Valentine's Socials`);
  const ban = new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans the offender")
    .addUserOption((option) =>
      option
        .setName("offender")
        .setDescription("User that gets banned")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Why is the user being banned")
        .setRequired(true),
    );
  const kick = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kicks the offender from the Server")
  .addUserOption((option) =>
    option
      .setName("offender")
      .setDescription("User that gets Kicked from the Server")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("reason")
      .setDescription("Why is the user being Kicked")
      .setRequired(true),
  );
  const warn = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Warns the User")
  .addUserOption((option) =>
    option
      .setName("offender")
      .setDescription("User to be warned")
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("reason")
      .setDescription("Why is the user being warned")
      .setRequired(true),
  );
  const banCommand = ban.toJSON();
  const utubeCommand = socials.toJSON();
  const kickCommand = kick.toJSON();
  const warnCommand = warn.toJSON();
  client.application.commands.create(utubeCommand, process.env.GUILD_ID);
  client.application.commands.create(banCommand, process.env.GUILD_ID);
  client.application.commands.create(kickCommand, process.env.GUILD_ID);
  client.application.commands.create(warnCommand, process.env.GUILD_ID);
});
client.on(Events.InteractionCreate, (interacion) => {
  const userOption = interacion.options.getMember("offender");
  const reason = interacion.options.getString("reason");
  const offenseLog = client.channels.cache.get(process.env.OFFENSE_LOG);
  const checkRole = interacion.member.roles.cache;
  const checkBanRoles = config.banRoleIDs.some((banRoleID) => checkRole.has(banRoleID));
  const checkKickRoles = config.kickRoleIDs.some((kickRoleID) => checkRole.has(kickRoleID));


  if (!interacion.isChatInputCommand) return;
  
//Socials Command....
  if (interacion.commandName === "socials") {
    interacion.reply(
      `The following are Valentine's Socials\n-YouTube:-${process.env.UTUBE}\n-Twitch:-${process.env.TWITCH}`,
    );
  }

//Ban Command...
  if (interacion.commandName === "ban") {
    if (!checkBanRoles) {
      return interacion.reply({
        content: "You do not have permission to use this command",
        ephemeral: true,
      });
    } else {
      userOption.ban({ reason: reason });
      interacion.reply(
        `${interacion.user} has banned ${userOption} for ${reason}`,
      );
      offenseLog.send(
        `Offender: ${userOption} \nOffense: ${reason} \nAction: Ban`,
      );
      userOption.send(
        `You have been Banned from **${interacion.guild.name}** for **${reason}**`,
      );
    }
  }

//Kick Command.....
  if (interacion.commandName === "kick") {
    if (!checkKickRoles) {
      return interacion.reply({
        content: "You do not have permission to use this command",
        ephemeral: true,
      });
    } else {
      userOption.kick({ reason: reason });
      interacion.reply(
        `${interacion.user} has Kicked ${userOption} for ${reason}`,
      );
      offenseLog.send(
        `Offender: ${userOption} \nOffense: ${reason} \nAction: Kick`,
      );
      userOption.send(
        `You have been Kicked from **${interacion.guild.name}** for **${reason}**`,
      );
    }
  }

//Warn Command....
  if (interacion.commandName === "warn") {
    if (!checkKickRoles) {
      return interacion.reply({
        content: "You do not have permission to use this command",
        ephemeral: true,
      });
    } else {
      userOption.send(
        `**${interacion.guild.name}:** You have been Warned\n**Reason:** ${reason}`,
      );
      interacion.reply(`You have warned ${userOption} for ${reason}`);
      offenseLog.send(`User: ${userOption}\nOffense: ${reason}\nAction: Warn`);
    }
  }


});

client.on("guildMemberAdd", (member) => {
  const guildName = member.guild.name;
  const welcomeEmbed = new EmbedBuilder()
    .setTitle(`Hello ${member.displayName}`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setDescription(
      `Welcome to ${guildName}! We hope you have a great time here. Make sure to read through our rules and have fun!`,
    )
    .setColor("#9D00FF");
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  channel.send(`${member}`);
  channel.send({ embeds: [welcomeEmbed] });
});
client.on("ready", (c) => {
  client.user.setActivity({
    name: "MonsterWood",
    type: ActivityType.Watching,
  });
});

client.login(process.env.TOKEN);