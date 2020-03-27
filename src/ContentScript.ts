chrome.runtime.onMessage.addListener((msg, _, send) => {
  if (msg.event === 'DOM') send(document);
});