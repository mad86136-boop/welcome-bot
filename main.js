const { Client, GatewayIntentBits, EmbedBuilder, Collection } = require('discord.js');
const moment = require('moment');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const SETTINGS = {
    TOKEN: "MTQ1OTE3OTMyOTg2MTg0OTIxMw.GOQ0Zj.4RsnnDnN1k4AIU06BUueeZeomy0KVnnPVWJ-F4", 
    ALLOWED_GUILDS: ["1483360253864316999", "1374197212074082410", "1476071713279180885"],
    WELCOME_CHANNEL_NAME: "🛬〡𝗪𝗲𝗹𝗰𝗼𝗺𝗲", // اسم الروم بالزخرفة
    SERVER_NAME: "Prind city", 
    BANNER_URL: "https://media.discordapp.net/attachments/1458343245934493924/1458992518250106999/Banner.gif?ex=69bc9fab&is=69bb4e2b&hm=77b9ecea118a09926528a05a2fe6ef926057da45e6d08ccc5977e36b8811988b&=&width=1265&height=712"
};

const invites = new Collection();

client.on('ready', async () => {
    console.log(`✅ البوت شغال وجاهز!`);
    client.guilds.cache.forEach(async (guild) => {
        if (SETTINGS.ALLOWED_GUILDS.includes(guild.id)) {
            const invs = await guild.invites.fetch().catch(() => new Collection());
            invites.set(guild.id, new Collection(invs.map(i => [i.code, i.uses])));
        }
    });
});

client.on('guildMemberAdd', async (member) => {
    if (!SETTINGS.ALLOWED_GUILDS.includes(member.guild.id)) return;

    // يبحث عن الروم بالاسم المزخرف اللي عطيته لي
    const channel = member.guild.channels.cache.find(c => c.name === SETTINGS.WELCOME_CHANNEL_NAME);
    
    if (!channel) return console.log(`❌ ما لقيت روم اسمها: ${SETTINGS.WELCOME_CHANNEL_NAME} في سيرفر ${member.guild.name}`);

    let inviter = "`Direct Link`";
    try {
        const newInvs = await member.guild.invites.fetch();
        const oldInvs = invites.get(member.guild.id);
        const invite = newInvs.find(i => i.uses > (oldInvs?.get(i.code) || 0));
        if (invite?.inviter) inviter = `<@${invite.inviter.id}>`;
        invites.set(member.guild.id, new Collection(newInvs.map(i => [i.code, i.uses])));
    } catch (e) { console.log("خطأ في جلب الدعوة"); }

    const embed = new EmbedBuilder()
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
        .setTitle(`Welcome To ${SETTINGS.SERVER_NAME}`)
        .setColor('#da0000')
        .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
        .addFields(
            { name: 'Member :', value: `${member}`, inline: true },
            { name: 'Create Discord :', value: `\`${moment(member.user.createdAt).fromNow()}\``, inline: true },
            { name: 'Number :', value: `\`${member.guild.memberCount}\``, inline: true },
            { name: 'Invited By :', value: inviter, inline: false }
        )
        .setImage(SETTINGS.BANNER_URL)
        .setTimestamp();

    channel.send({ embeds: [embed] }).catch(err => console.log("خطأ في الإرسال: " + err));
});

client.login(SETTINGS.TOKEN);
