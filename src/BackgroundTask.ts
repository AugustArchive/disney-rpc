import Ichigo, { ActivityOptions } from './ichigo/Ichigo';
const rpc = new Ichigo('693142227811303454');
rpc.connect();

const REGEX = /^https?:\/\/(?:[^./?#]+\.)?disneyplus\.com/;
chrome.browserAction.onClicked.addListener((tab) => {
  if (REGEX.test(tab.url!)) chrome.tabs.sendMessage(tab.id!, { event: 'DOM' }, onRequest);
});

function onRequest(doc: Document) {
  console.log('Received the document\'s body! Now setting up RPC...');

  const video = document.querySelector<HTMLVideoElement>('.btm-media-client-element');
  if (video !== null && !isNaN(video.duration)) {
    const title = document.querySelector<HTMLDivElement>('.btm-media-overlays-container > .overlay > .controls .controls__header');
    const subtitle = document.querySelector<HTMLDivElement>('.btm-media-overlays-container > .overlay > .controls .controls__header');

    const started = Date.now();
    /*const activity: ActivityOptions = {
      instance: false,
      details: `📺 Watching ${title === null ? 'Nothing...' : title!.textContent}`,
      state: subtitle === null ? undefined : subtitle.textContent!,
      timestamps: {
        start: started,
        end: (Math.floor(started / 1000) - Math.floor(video.currentTime) + Math.floor(video.duration))
      }
    }*/

    const activity: ActivityOptions = {
      instance: false,
      details: 'test',
      state: 'test',
      assets: {
        large_image: 'disney',
        large_text: 'Disney+ RPC made by August'
      }
    };

    rpc.setActivity(activity);
    console.log('Set the activity!');
  }
}