chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, {
      message: 'tab_updated',
      url: changeInfo.url,
    });
  }
});

chrome.action.onClicked.addListener(async tab => {
  const component = await checkComponentExistence(tab.id!);
  if (component) {
    chrome.tabs.sendMessage(tab.id!, { message: 'toggle_component' });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      files: ['js/content.js'],
    });
  }
});

async function checkComponentExistence(tabId: number) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => !!document.querySelector('read-with-me-shadow-host'),
  });
  return result[0].result;
}
