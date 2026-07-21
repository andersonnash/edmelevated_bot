async function postSceneFeed(client, channelId, payload) {
  const channel = await client.channels.fetch(channelId).catch(() => null);

  if (!channel) {
    console.warn("Scene feed channel not found");
    return;
  }

  return channel.send(payload);
}

module.exports = {
  postSceneFeed,
};
