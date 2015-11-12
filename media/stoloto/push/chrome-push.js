var Finch = Finch || {};
Finch.ChromePush = {
	init: function(serviceWorkerUrl, postUrl){
		if(!this.isEnabled()){
			return;
		}
		var that = this;
		navigator.serviceWorker.register(serviceWorkerUrl).then(function(r){
			console.log("service worker installed successfully");
		}).catch(function(e){
			console.log("service worker installation failed");
			console.log(e);
		}).then(function(){
			navigator.serviceWorker.ready.then(function(reg) {
				reg.pushManager.getSubscription().then(function(subscription){
					if(subscription != null){
						that.postToken(postUrl, subscription.endpoint.split("/").pop());
					}else{
						reg.pushManager.subscribe({userVisibleOnly: true}).then(function(subscription) {  
							that.postToken(postUrl, subscription.endpoint.split("/").pop());
						}).catch(function(e) {  
							console.log("permission is " + Notification.permission);
							console.log(e);
						});
					}
				}).catch(function(e){
					console.log("get subscription failed ");
					console.log(e);
				});
			});
		});
	},
	isEnabled: function(){
		if(!navigator.serviceWorker){
			return false;
		}
		if(!window.Notification){
			return false;
		}
		if(Notification.permission == "denied"){
			return false;
		}
		return true;
	},
	postToken: function(url, token){
		var o = new XMLHttpRequest();
        o.open('POST', url, true);
		o.onreadystatechange = function() {
            if (4 == o.readyState) {
                if (200 !== o.status){ 
					console.log("post token failed. status code is " + o.status);
				}else{
					console.log("post token successed.");
				}				
            }
        };
		o.send(null)
	}
};