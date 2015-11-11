self.addEventListener('push', function(event) {  
  console.log('Received a push message', event);
  console.log("event data", event.data);

  var title = 'Yay a message.';  
  var body = 'We have received a push message.';  
  var icon = '/images/icon-192x192.png';  
  var tag = 'simple-push-demo-notification-tag';

event.waitUntil(  
    fetch("https://gavricus.github.io/test.json").then(function(response) {  
      if (response.status !== 200) {  
        console.log('Looks like there was a problem. Status Code: ' + response.status);  
        throw new Error();  
      }

      return response.json().then(function(data) {  
		if(!data.messages){
			return;
		}

        var title = data.messages[0].title;  
        var message = "data.notification.message";  
        var icon = "https://www.stoloto.ru/media/stoloto/push/stoloto.png";  
        var notificationTag = "data.notification.tag";

        return self.registration.showNotification(title, {  
          body: message,  
          icon: icon,  
          tag: notificationTag  
        });  
      });  
    }).catch(function(err) {  
      console.error('Unable to retrieve data', err);
    })  
  );
});