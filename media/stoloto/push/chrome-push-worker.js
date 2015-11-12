var Finch = Finch || {};
Finch.Worker = {
	onPush: function(url){
		console.log('Received a push event');
		event.waitUntil(  
			fetch(url).then(function(response) {  
				if (response.status !== 200) {  
					throw new Error('Looks like there was a problem. Status Code: ' + response.status);  
				}
				return response.json().then(function(data) {  
					if(!data.messages){
						return;
					}
					var msg = data.messages[0];
					return self.registration.showNotification(msg.title, {  
						body: msg.message,  
						icon: "https://www.stoloto.ru/media/stoloto/push/stoloto.png",  
						url: msg.url,
					});  
				});  
			}).catch(function(err) {  
				console.error('Unable to retrieve data', err);
			})  
		);
	},
	onNotificationClick: function(event){
		event.notification.close();
		if (clients.openWindow) {
			return clients.openWindow(event.notification.url);  
		}
	}
}