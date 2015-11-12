importScripts("media/stoloto/push/chrome-push-worker.js");
self.addEventListener('push', function(e){
	Finch.Worker.onPush("https://gavricus.github.io/push.json");
});
self.addEventListener('notificationclick', Finch.Worker.onNotificationClick);