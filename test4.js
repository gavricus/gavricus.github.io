importScripts("media/stoloto/push/chrome-push-worker.js");
self.addEventListener('push', function(e){
	Finch.Worker.onPush("");
});
self.addEventListener('notificationclick', Finch.Worker.onNotificationClick);