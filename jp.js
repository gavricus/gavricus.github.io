function in_array(e, i, t) {
    var n, a = !1,
        t = !!t;
    for (n in i)
        if (t && i[n] === e || !t && i[n] == e) {
            a = !0;
            break
        }
    return a
}
window.Jeapie || (window.Jeapie = []);
var tempJeapie = null;
"undefined" != typeof Jeapie && (tempJeapie = Jeapie);
var Jeapie = {
    sdkVersion: "0.2.7",
    hostUrl: "https://go.jeapie.com/api/v2/web/browser",
    logging: !0,
    initParams: null,
    jeapiePushDb: null,
    messageListener: null,
    appKey: "5903abda22ec662ba01d501f3e886503",
    subdomainName: null,
    jeapieMode: null,
    isHttp: false,
    webSiteDomain: "https://jeapie.com",
    autoRegister: !0,
    deviceToken: null,
    safariFirstPrompt: null,
    log: function(e) {
        1 == Jeapie.logging && console.log(e)
    },
    processPushes: function(e) {
        for (var i = 0; i < e.length; i++) Jeapie.push(e[i])
    },
    push: function(e) {
        if ("function" == typeof e) e();
        else {
            var i = e.shift();
            Jeapie[i].apply(null, e)
        }
    },
    init: function(e) {
        Jeapie.checkBrowser() && ("undefined" != typeof e && (Jeapie.initParams = e, Jeapie.initParams.createLineWidget && Jeapie.initParams.createLineWidget.init && Jeapie.subscribeWithWidget(!1, !0), Jeapie.initParams.createButton && Jeapie.subscribeWithWidget(!0), 0 == Jeapie.initParams.autoRegister && (Jeapie.autoRegister = !1)), window.addEventListener("load", function() {
            if ("chrome" == Jeapie.jeapieMode) {
                if (Jeapie.isHttp) return void(Jeapie.autoRegister && Jeapie.subscribeWithWidget(!1, !1, !0));
                manifest = document.createElement("link"), manifest.rel = "manifest", manifest.href = Jeapie.webSiteDomain + "/manifest.json", document.head.appendChild(manifest), Jeapie.initWorker()
            }
            Jeapie.autoRegister && Jeapie.getSubscription(function(e) {
                e ? Jeapie.isSubscriptionChanged(e) : "chrome" == Jeapie.jeapieMode && Jeapie.subscribe(function(e) {
                    Jeapie.putValueToDb("Ids", {
                        type: "SubscriptionId",
                        value: e
                    }), Jeapie.putValueToDb("Ids", {
                        type: "deviceId",
                        value: Jeapie.md5(e)
                    }), Jeapie.registerNewUser(e, function() {
                        Jeapie.createOnResultEvent(e)
                    })
                })
            })
        }))
    },
    createOnResultEvent: function(e) {
        Jeapie.deviceToken = e;
        var i = new Event("jeapieresult");
        document.dispatchEvent(i)
    },
    afterSubscription: function(e) {
        document.addEventListener("jeapieresult", function(i) {
            return e(Jeapie.deviceToken)
        }, !1)
    },
    registerUserForPush: function(e) {
        "safari" == Jeapie.jeapieMode ? Jeapie.checkRemotePermission(window.safari.pushNotification("web.web.jeapie.de1e67615f333e7c08a94599fb589b88"), function(e) {
            e && Jeapie.safariFirstPrompt && (Jeapie.createOnResultEvent(e), Jeapie.safariFirstPrompt = null)
        }) : Jeapie.subdomainName ? Jeapie.registerHttp() : Jeapie.getSubscription(function(i) {
            i ? Jeapie.isSubscriptionChanged(i) : Jeapie.subscribe(function(i) {
                Jeapie.putValueToDb("Ids", {
                    type: "SubscriptionId",
                    value: i
                }), Jeapie.registerNewUser(i, function(t) {
                    return t ? (Jeapie.createOnResultEvent(i), e(t)) : void 0
                })
            })
        })
    },
    initDb: function(e) {
        if (Jeapie.jeapiePushDb) return void e();
        var i = indexedDB.open("jeapie_push_sdk_db", 1);
        i.onsuccess = function(i) {
            Jeapie.jeapiePushDb = i.target.result, e()
        }, i.onupgradeneeded = function(e) {
            var i = e.target.result;
            i.createObjectStore("Ids", {
                keyPath: "type"
            }), i.createObjectStore("NotificationOpened", {
                keyPath: "key"
            }), i.createObjectStore("Options", {
                keyPath: "key"
            })
        }
    },
    getDbValue: function(e, i, t) {
        Jeapie.initDb(function() {
            Jeapie.jeapiePushDb.transaction(e).objectStore(e).get(i).onsuccess = t
        })
    },
    getAllValues: function(e, i) {
        Jeapie.initDb(function() {
            var t = {};
            Jeapie.jeapiePushDb.transaction(e).objectStore(e).openCursor().onsuccess = function(e) {
                var n = e.target.result;
                n ? (t[n.key] = n.value.value, n["continue"]()) : i(t)
            }
        })
    },
    putValueToDb: function(e, i) {
        Jeapie.initDb(function() {
            Jeapie.jeapiePushDb.transaction([e], "readwrite").objectStore(e).put(i)
        })
    },
    deleteDbValue: function(e, i) {
        Jeapie.initDb(function() {
            Jeapie.jeapiePushDb.transaction([e], "readwrite").objectStore(e)["delete"](i)
        })
    },
    initWorker: function() {
        return "serviceWorker" in navigator && navigator.serviceWorker.register("/push-worker.js").then(function(e) {
            Jeapie.log("Worker registered")
        })["catch"](function(e) {
            return Jeapie.log(e), !1
        }), !0
    },
    send: function(e, i, t, n) {
        if ("chrome" == Jeapie.jeapieMode) {
            var a = {
                method: i
            };
            t && (a.body = JSON.stringify(t)), fetch(e, a).then(function(e) {
                return 200 !== e.status ? void Jeapie.log("Looks like there was a problem. Status Code: " + e.status) : void e.json().then(function(e) {
                    return Jeapie.log("data successfully sent"), "function" == typeof n ? n(e) : void 0
                })
            })["catch"](function(e) {
                Jeapie.log("Fetch Error :-S", e)
            })
        } else {
            var o = new XMLHttpRequest;
            o.open(i, e, !0), o.onreadystatechange = function() {
                if (4 == o.readyState) {
                    if (200 !== o.status) return void Jeapie.log("Looks like there was a problem. Status Code: " + o.status);
                    if (Jeapie.log("data successfully sent"), "function" == typeof n) return n(o.responseText)
                }
            }, o.send(null)
        }
    },
    getGetUrlWithObject: function(e, i) {
        return e + "?app_key=" + Jeapie.appKey + "&data=" + JSON.stringify(i)
    },
    checkRemotePermission: function(e, i) {
        if ("default" === e.permission) Jeapie.safariFirstPrompt = !0, window.safari.pushNotification.requestPermission("https://go.jeapie.com/safari/5903abda22ec662ba01d501f3e886503", "web.web.jeapie.de1e67615f333e7c08a94599fb589b88", {}, function(e) {
            Jeapie.checkRemotePermission(e, i)
        });
        else {
            if ("denied" === e.permission) return i();
            if ("granted" === e.permission) return Jeapie.isSubscriptionChanged(e.deviceToken), i(e.deviceToken)
        }
    },
    registerHttp: function() {
        if ("safari" == Jeapie.jeapieMode) Jeapie.checkRemotePermission(window.safari.pushNotification.permission("web.web.jeapie.de1e67615f333e7c08a94599fb589b88"), function(e) {
            e && Jeapie.safariFirstPrompt && (Jeapie.createOnResultEvent(e), Jeapie.safariFirstPrompt = null)
        });
        else {
            if (!Jeapie.isHttp || null === Jeapie.subdomainName || !Jeapie.isPushManagerSupported()) return;
            var e = void 0 != window.screenLeft ? window.screenLeft : screen.left,
                i = void 0 != window.screenTop ? window.screenTop : screen.top,
                t = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width,
                n = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height,
                a = 600,
                o = 350,
                r = t / 2 - a / 2 + e,
                p = n / 2 - o / 2 + i,
                s = window.open("https://" + Jeapie.subdomainName + ".jeapie.com/subscribe?utm_source=" + Jeapie.subdomainName, "_blank", "scrollbars=yes, width=" + a + ", height=" + o + ", top=" + p + ", left=" + r);
            s && s.focus(), Jeapie.createMessageListener()
        }
    },
    isSubscribed: function(e) {
        if ("chrome" != Jeapie.jeapieMode) {
            var i = window.safari.pushNotification.permission("web.web.jeapie.de1e67615f333e7c08a94599fb589b88").permission;
            return e("granted" == i ? !0 : !1)
        }
        Jeapie.getSubscription(function(i) {
            return e(i ? !0 : !1)
        })
    },
    getSubscription: function(e) {
        if ("chrome" == Jeapie.jeapieMode) Jeapie.isHttp ? Jeapie.getDbValue("Ids", "SubscriptionId", function(i) {
            return i.target.result ? e(i.target.result.value) : e()
        }) : navigator.serviceWorker.ready.then(function(i) {
            i.pushManager.getSubscription().then(function(i) {
                return i ? (subscriptionId = "subscriptionId" in i ? i.subscriptionId : i.endpoint, subscriptionId = Jeapie.endpointWorkaround(subscriptionId), e(subscriptionId)) : e()
            })["catch"](function(e) {
                Jeapie.log("Error during getSubscription()", e)
            })
        });
        else {
            var i = window.safari.pushNotification.permission("web.web.jeapie.de1e67615f333e7c08a94599fb589b88");
            Jeapie.checkRemotePermission(i, function(e) {
                e && Jeapie.safariFirstPrompt && (Jeapie.createOnResultEvent(e), Jeapie.safariFirstPrompt = null)
            })
        }
    },
    isSubscriptionChanged: function(e) {
        Jeapie.getDbValue("Ids", "SubscriptionId", function(i) {
            if (i.target.result) {
                if (i.target.result.value != e) {
                    var t = {
                        type: "token",
                        device_id: Jeapie.md5("chrome" == Jeapie.jeapieMode ? i.target.result.value : i.target.result.value + Jeapie.appKey),
                        value: e,
                        time: Jeapie.getCurrentTimestamp()
                    };
                    return url = Jeapie.getGetUrlWithObject(Jeapie.hostUrl, t, !0), void Jeapie.send(url, "get", !1, function(i) {
                        i && Jeapie.createOnResultEvent(e)
                    })
                }
            } else i.target.result || "safari" != Jeapie.jeapieMode || (Jeapie.putValueToDb("Ids", {
                type: "SubscriptionId",
                value: e
            }), Jeapie.registerNewUser(e, function(i) {
                i && Jeapie.createOnResultEvent(e)
            }))
        })
    },
    subscribeWithWidget: function(e, i, t) {
        ("chrome" == Jeapie.jeapieMode || "safari" == Jeapie.jeapieMode) && (Jeapie.isHttp ? "chrome" == Jeapie.jeapieMode ? Jeapie.getDbValue("Ids", "SubscriptionId", function(n) {
            n.target.result || Jeapie.appendWidgets(e, i, t)
        }) : "default" == window.safari.pushNotification.permission("web.web.jeapie.de1e67615f333e7c08a94599fb589b88").permission && Jeapie.appendWidgets(e, i, t) : "chrome" == Jeapie.jeapieMode ? Jeapie.getSubscription(function(n) {
            n || Jeapie.appendWidgets(e, i, t)
        }) : "default" == window.safari.pushNotification.permission("web.web.jeapie.de1e67615f333e7c08a94599fb589b88").permission && Jeapie.appendWidgets(e, i, t))
    },
    appendWidgets: function(e, i, t) {
        if (t && Jeapie.createNativePrompt(), e && Jeapie.createButton(), i && Jeapie.createLine(), null === document.getElementById("jeapie-button-style")) {
            var n = document.getElementsByTagName("head")[0],
                a = document.createElement("link");
            a.id = "jeapie-button-style", a.rel = "stylesheet", a.type = "text/css", a.href = "https://cdn.jeapie.com/jeapiecss/pushbutton.css", a.media = "all", n.appendChild(a)
        }
    },
    createButton: function() {
        function e() {
            setInterval(function() {
                var e = document.getElementById("jeapie-push-container");
                e.className = e.className + " jeapie-shake-animated jeapie-shake", setTimeout(function() {
                    e.className = ""
                }, 1e3)
            }, 9e4)
        }

        function i() {
            document.getElementById("jeapie-push-tooltip").style.display = "block", document.getElementById("jeapie-push-dont-show").style.display = "block"
        }

        function t() {
            document.getElementById("jeapie-push-tooltip").style.display = "block"
        }

        function n() {
            document.getElementById("jeapie-push-tooltip").style.display = "none", setTimeout(function() {
                document.getElementById("jeapie-push-dont-show").style.display = "none"
            }, 6e3)
        }

        function a() {
            Jeapie.setCookie("dontShowButton", !0, 7), Jeapie.removeWidget(["jeapie-push-container"])
        }
        if (!Jeapie.checkCookie("dontShowButton")) {
            Jeapie.initParams.tooltipText || (Jeapie.initParams.tooltipText = "Подпишитесь на наши обновления в один клик!");
            var o = document.createElement("button");
            o.id = "jeapie-push-button";
            var r = document.createElement("span");
            r.id = "jeapie-push-tooltip";
            var p = document.createTextNode(Jeapie.initParams.tooltipText);
            r.appendChild(p);
            var s = document.createElement("span");
            s.id = "jeapie-push-dont-show";
            var c = document.createTextNode("x");
            s.appendChild(c);
            var u = document.createElement("div");
            u.id = "jeapie-push-container", u.appendChild(o), u.appendChild(r), u.appendChild(s), Jeapie.checkCookie("firstSeen") ? (document.body.appendChild(u), e(), document.getElementById("jeapie-push-button").onmouseover = i, document.getElementById("jeapie-push-button").onmouseout = n, document.getElementById("jeapie-push-button").onclick = Jeapie.registerOnWidgetClick, document.getElementById("jeapie-push-dont-show").onclick = a) : setTimeout(function() {
                document.body.appendChild(u), Jeapie.setCookie("firstSeen", !0, 30);
                var o = document.getElementById("jeapie-push-container");
                o.className = o.className + " jeapie-animated jeapie-rollin", setTimeout(function() {
                    t()
                }, 1e3), setTimeout(function() {
                    n(), o.className = ""
                }, 3e3), e(), document.getElementById("jeapie-push-button").onmouseover = i, document.getElementById("jeapie-push-button").onmouseout = n, document.getElementById("jeapie-push-button").onclick = Jeapie.registerOnWidgetClick, document.getElementById("jeapie-push-dont-show").onclick = a
            }, 2e3), Jeapie.createMessageListener()
        }
    },
    createNativePrompt: function() {
        if (!Jeapie.checkCookie("dontShowPrompt")) {
            var e = " wants to:",
                i = "  Send notifications",
                t = "Allow",
                n = "Block",
                a = document.createElement("div");
            a.id = "jeapie-prompt-widget", ("ru" == Jeapie.getBrowserlanguage() || "uk" == Jeapie.getBrowserlanguage()) && (e = " запрашивает разрешение на:", i = "  отправку оповещений", t = "Разрешить", n = "Блокировать", a.className = "jeapie-ru-block");
            var o = document.createElement("div");
            o.id = "jeapie-prompt-closer";
            var r = document.createElement("span");
            r.id = "jeapie-prompt-closer-char";
            var p = String.fromCharCode(10761),
                s = document.createTextNode(p);
            r.appendChild(s), o.appendChild(r);
            var c = document.createElement("div");
            c.id = "jeapie-prompt-domain-name";
            var s = document.createTextNode(document.domain + e);
            c.appendChild(s);
            var u = "f0 9f 94 94",
                d = decodeURIComponent(u.replace(/\s+/g, "").replace(/[0-9a-f]{2}/g, "%$&"));
            d += "  ";
            var l = document.createElement("div");
            l.id = "jeapie-prompt-bell-text";
            var m = document.createTextNode(d + i);
            l.appendChild(m);
            var f = document.createElement("div");
            f.id = "jeapie-prompt-buttons", ("ru" == Jeapie.getBrowserlanguage() || "uk" == Jeapie.getBrowserlanguage()) && (f.className = "jeapie-prompt-buttons-ru", o.className = "jeapie-prompt-closer-ru");
            var g = document.createElement("div");
            g.id = "jeapie-prompt-allow-button", g.className = "jeapie-prompt-button";
            var J = document.createTextNode(t);
            g.appendChild(J);
            var h = document.createElement("div");
            h.id = "jeapie-prompt-block-button", h.className = "jeapie-prompt-button";
            var v = document.createTextNode(n);
            h.appendChild(v), f.appendChild(g), f.appendChild(h), a.appendChild(o), a.appendChild(c), a.appendChild(l), a.appendChild(f), document.body.appendChild(a), document.getElementById("jeapie-prompt-closer-char").addEventListener("click", function(e) {
                e.preventDefault(), Jeapie.removeWidget(["jeapie-prompt-widget"])
            }), document.getElementById("jeapie-prompt-block-button").addEventListener("click", function(e) {
                e.preventDefault(), Jeapie.setCookie("dontShowPrompt", !0, 7), Jeapie.removeWidget(["jeapie-prompt-widget"])
            }), document.getElementById("jeapie-prompt-allow-button").addEventListener("click", function(e) {
                e.preventDefault(), Jeapie.removeWidget(["jeapie-prompt-widget"]), Jeapie.registerOnWidgetClick()
            })
        }
    },
    createLine: function() {
        function e() {
            var e = window.pageYOffset || document.documentElement.scrollTop;
            e > 150 ? i() : t()
        }

        function i() {
            "block" != n.style.display && (n.style.display = "block")
        }

        function t() {
            "block" == n.style.display && (n.style.display = "none")
        }
        if (!Jeapie.checkCookie("dontShowLine") && Jeapie.initParams.createLineWidget && Jeapie.initParams.createLineWidget.init) {
            var n = document.createElement("div");
            n.id = "jeapie-line-widget", n.style.background = Jeapie.initParams.createLineWidget.background || "#1ab394", n.style.color = Jeapie.initParams.createLineWidget.color || "#fff";
            var a = document.createElement("span");
            if (a.id = "jeapie-line-text", Jeapie.initParams.createLineWidget.showbell) {
                var o = "f0 9f 94 94",
                    r = decodeURIComponent(o.replace(/\s+/g, "").replace(/[0-9a-f]{2}/g, "%$&"));
                r += "  ";
                var p = document.createElement("span");
                p.id = "jeapie-bell-character";
                var s = document.createTextNode(r);
                p.appendChild(s), n.appendChild(p)
            }
            var c = document.createTextNode(Jeapie.initParams.createLineWidget.text || "We need your permissions to enable desktop notifications");
            a.appendChild(c);
            var u = document.createElement("a");
            u.id = "jeapie-line-closer", u.style.color = Jeapie.initParams.createLineWidget.color || "#fff";
            var c = document.createTextNode("x");
            u.appendChild(c), n.appendChild(a), n.appendChild(u), document.body.appendChild(n), document.getElementById("jeapie-line-closer").addEventListener("click", function(e) {
                e.preventDefault(), Jeapie.lineDeleted = !0, Jeapie.setCookie("dontShowLine", !0, 7), Jeapie.removeWidget(["jeapie-line-widget"])
            }), Jeapie.lineDeleted || (n.onclick = Jeapie.registerOnWidgetClick), onloadPosition = window.pageYOffset || document.documentElement.scrollTop, "top" != Jeapie.initParams.createLineWidget.position && Jeapie.initParams.createLineWidget.position ? (n.style.bottom = 0, i()) : (n.style.top = 0, onloadPosition > 150 && i(), window.addEventListener("scroll", e, !1))
        }
    },
    registerOnWidgetClick: function() {
        if ("safari" == Jeapie.jeapieMode) {
            Jeapie.removeWidget(["jeapie-line-widget", "jeapie-push-container", "jeapie-prompt-widget"]);
            var e = window.safari.pushNotification.permission("web.web.jeapie.de1e67615f333e7c08a94599fb589b88");
            Jeapie.checkRemotePermission(e, function(e) {
                e && Jeapie.safariFirstPrompt && (Jeapie.createOnResultEvent(e), Jeapie.safariFirstPrompt = null)
            })
        } else Jeapie.isHttp ? Jeapie.registerHttp() : Jeapie.registerUserForPush(function(e) {
            e && Jeapie.removeWidget(["jeapie-line-widget", "jeapie-push-container", "jeapie-prompt-widget"])
        })
    },
    createMessageListener: function() {
        function e(e) {
            e.data.httpRegisterd && (Jeapie.putValueToDb("Ids", {
                type: "SubscriptionId",
                value: e.data.subscriptionId
            }), Jeapie.createOnResultEvent(e.data.subscriptionId), Jeapie.removeWidget(["jeapie-line-widget", "jeapie-push-container", "jeapie-prompt-widget"]))
        }
        Jeapie.messageListener || (window.addEventListener("message", e, !1), Jeapie.messageListener = !0)
    },
    removeWidget: function(e) {
        for (var i in e) {
            var t = e[i],
                n = document.getElementById(t);
            null !== n && n.parentNode.removeChild(n)
        }
    },
    subscribe: function(e) {
        return navigator.serviceWorker.ready.then(function(i) {
            i.pushManager.subscribe({
                userVisibleOnly: !0
            }).then(function(i) {
                return subscriptionId = "subscriptionId" in i ? i.subscriptionId : i.endpoint, null != subscriptionId ? (subscriptionId = Jeapie.endpointWorkaround(subscriptionId), e(subscriptionId)) : void 0
            })["catch"](function(e) {
                "denied" === Notification.permission ? (Jeapie.log("Permission for Notifications was denied"), Jeapie.removeWidget(["jeapie-line-widget", "jeapie-push-container", "jeapie-prompt-widget"])) : Jeapie.log("Unable to subscribe to push.", e)
            })
        }), !0
    },
    showWelcomeNotification: function(e, i, t, n, a) {
        if ("chrome" == Jeapie.jeapieMode) {
            var o = {
                    body: i,
                    icon: t,
                    data: {
                        redirect_url: n,
                        device_id: a
                    }
                },
                r = new Notification(e, o);
            r.onclick = function(e) {
                if (e.target && e.target.data && e.target.data.redirect_url && e.target.data.device_id) {
                    var i = {
                            type: "welcome_opened",
                            device_id: e.target.data.device_id,
                            time: Math.floor(Date.now() / 1e3)
                        },
                        t = Jeapie.getGetUrlWithObject(Jeapie.hostUrl, i, !0);
                    Jeapie.send(t, "get", !1, function() {}), window.location = e.target.data.redirect_url
                } else Jeapie.getSubscription(function(e) {
                    if (e) {
                        var i = {
                                type: "welcome_opened",
                                device_id: Jeapie.md5(e),
                                time: Math.floor(Date.now() / 1e3)
                            },
                            t = Jeapie.getGetUrlWithObject(Jeapie.hostUrl, i, !0);
                        Jeapie.send(t, "get", !1, function() {})
                    }
                }), window.location = Jeapie.webSiteDomain
            }
        }
    },
    registerNewUser: function(e, i) {
        var t = {
                type: "register",
                os: "chrome" == Jeapie.jeapieMode ? 6 : 7,
                device_id: Jeapie.md5("chrome" == Jeapie.jeapieMode ? e : e + Jeapie.appKey),
                os_v: Jeapie.detectBrowser().version,
                lib_v: Jeapie.sdkVersion,
                screen_w: Jeapie.getScreenWidth(),
                screen_h: Jeapie.getScreenHeight(),
                tz: Jeapie.getTimezone(),
                lang: Jeapie.getBrowserlanguage(),
                token: e,
                time: Jeapie.getCurrentTimestamp()
            },
            n = Jeapie.getGetUrlWithObject(Jeapie.hostUrl, t, !0);
        Jeapie.send(n, "get", !1, function(e) {
            if (e && e.jeapiewelcome) {
                var t = e.jeapiewelcome;
                Jeapie.showWelcomeNotification(t.title, t.body, t.icon, t.redirect_url, t.device_id)
            }
            return i(e)
        })
    },
    addTag: function(e) {
        Jeapie.getDbValue("Ids", "SubscriptionId", function(i) {
            if (i.target.result) {
                var t = {
                        type: "add_tag",
                        device_id: Jeapie.md5("chrome" == Jeapie.jeapieMode ? i.target.result.value : i.target.result.value + Jeapie.appKey),
                        value: e,
                        time: Jeapie.getCurrentTimestamp()
                    },
                    n = Jeapie.getGetUrlWithObject(Jeapie.hostUrl, t, !0);
                Jeapie.send(n, "get", !1, function() {})
            }
        })
    },
    setTags: function(e) {
        Jeapie.getDbValue("Ids", "SubscriptionId", function(i) {
            if (i.target.result) {
                var t = {
                        type: "set_tags",
                        device_id: Jeapie.md5("chrome" == Jeapie.jeapieMode ? i.target.result.value : i.target.result.value + Jeapie.appKey),
                        value: e,
                        time: Jeapie.getCurrentTimestamp()
                    },
                    n = Jeapie.getGetUrlWithObject(Jeapie.hostUrl, t, !0);
                Jeapie.send(n, "get", !1, function() {})
            }
        })
    },
    removeTag: function(e) {
        Jeapie.getDbValue("Ids", "SubscriptionId", function(i) {
            if (i.target.result) {
                var t = {
                        type: "remove_tag",
                        device_id: Jeapie.md5("chrome" == Jeapie.jeapieMode ? i.target.result.value : i.target.result.value + Jeapie.appKey),
                        value: e,
                        time: Jeapie.getCurrentTimestamp()
                    },
                    n = Jeapie.getGetUrlWithObject(Jeapie.hostUrl, t, !0);
                Jeapie.send(n, "get", !1, function() {})
            }
        })
    },
    removeAllTags: function() {
        Jeapie.getDbValue("Ids", "SubscriptionId", function(e) {
            if (e.target.result) {
                var i = {
                        type: "remove_all_tags",
                        device_id: Jeapie.md5("chrome" == Jeapie.jeapieMode ? e.target.result.value : e.target.result.value + Jeapie.appKey),
                        time: Jeapie.getCurrentTimestamp()
                    },
                    t = Jeapie.getGetUrlWithObject(Jeapie.hostUrl, i, !0);
                Jeapie.send(t, "get", !1, function() {})
            }
        })
    },
    setAlias: function(e) {
        Jeapie.getDbValue("Ids", "SubscriptionId", function(i) {
            if (i.target.result) {
                var t = {
                        type: "alias",
                        device_id: Jeapie.md5("chrome" == Jeapie.jeapieMode ? i.target.result.value : i.target.result.value + Jeapie.appKey),
                        value: e,
                        time: Jeapie.getCurrentTimestamp()
                    },
                    n = Jeapie.getGetUrlWithObject(Jeapie.hostUrl, t, !0);
                Jeapie.send(n, "get", !1, function() {})
            }
        })
    },
    setCookie: function(e, i, t) {
        var n = new Date;
        n.setTime(n.getTime() + 24 * t * 60 * 60 * 1e3);
        var a = "; expires=" + n.toUTCString();
        document.cookie = encodeURIComponent(e) + "=" + encodeURIComponent(i) + a + "; path=/"
    },
    checkCookie: function(e) {
        for (var i = e + "=", t = document.cookie.split(";"), n = 0; n < t.length; n++) {
            for (var a = t[n];
                " " == a.charAt(0);) a = a.substring(1);
            if (0 == a.indexOf(i)) return a.substring(i.length, a.length)
        }
        return ""
    },
    checkBrowser: function() {
        if (-1 == document.baseURI.indexOf(Jeapie.webSiteDomain)) return console.log("You must use this SDK only for " + Jeapie.webSiteDomain), !1;
        if (Jeapie.checkIfSafariNotification()) Jeapie.jeapieMode = "safari";
        else {
            if (!Jeapie.isPushManagerSupported()) return Jeapie.log("Push messaging isn't supported."), !1;
            if (!Jeapie.isNotificationsSupported()) return Jeapie.log("Notifications aren't supported."), !1;
            if (!Jeapie.isNotificationPermitted()) return Jeapie.log("The user has blocked notifications."), !1;
            Jeapie.jeapieMode = "chrome"
        }
        return "opera" == Jeapie.detectBrowser().name.toLowerCase() ? !1 : !0
    },
    getScreenWidth: function() {
        return window.screen ? screen.width : 0
    },
    getScreenHeight: function() {
        return window.screen ? screen.height : 0
    },
    isNotificationsSupported: function() {
        return "showNotification" in ServiceWorkerRegistration.prototype
    },
    isNotificationPermitted: function() {
        return "denied" != Notification.permission
    },
    isPushManagerSupported: function() {
        return "PushManager" in window
    },
    getCurrentTimestamp: function() {
        return Math.floor(Date.now() / 1e3)
    },
    getBrowserlanguage: function() {
        return navigator.language.substring(0, 2)
    },
    checkIfSafariNotification: function() {
        return "safari" in window && "pushNotification" in window.safari
    },
    getTimezone: function() {
        return -60 * (new Date).getTimezoneOffset()
    },
    detectBrowser: function() {
        var e, i = navigator.userAgent,
            t = i.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        return /trident/i.test(t[1]) ? (e = /\brv[ :]+(\d+)/g.exec(i) || [], {
            name: "IE",
            version: e[1] || ""
        }) : "Chrome" === t[1] && (e = i.match(/\bOPR\/(\d+)/), null != e) ? {
            name: "Opera",
            version: e[1]
        } : (t = t[2] ? [t[1], t[2]] : [navigator.appName, navigator.appVersion, "-?"], null != (e = i.match(/version\/(\d+)/i)) && t.splice(1, 1, e[1]), {
            name: t[0],
            version: t[1]
        })
    },
    endpointWorkaround: function(e) {
        if (~e.indexOf("https://android.googleapis.com/gcm/send")) {
            var i = e.split("https://android.googleapis.com/gcm/send/");
            return i[1]
        }
        return e
    },
    md5: function(e) {
        var i, t, n, a, o, r, p, s, c, u = function(e) {
                e = e.replace(/\r\n/g, "\n");
                for (var i = "", t = 0; t < e.length; t++) {
                    var n = e.charCodeAt(t);
                    128 > n ? i += String.fromCharCode(n) : n > 127 && 2048 > n ? (i += String.fromCharCode(n >> 6 | 192), i += String.fromCharCode(63 & n | 128)) : (i += String.fromCharCode(n >> 12 | 224), i += String.fromCharCode(n >> 6 & 63 | 128), i += String.fromCharCode(63 & n | 128))
                }
                return i
            },
            d = function(e, i) {
                return e << i | e >>> 32 - i
            },
            l = function(e, i) {
                var t, n, a, o, r;
                return a = 2147483648 & e, o = 2147483648 & i, t = 1073741824 & e, n = 1073741824 & i, r = (1073741823 & e) + (1073741823 & i), t & n ? 2147483648 ^ r ^ a ^ o : t | n ? 1073741824 & r ? 3221225472 ^ r ^ a ^ o : 1073741824 ^ r ^ a ^ o : r ^ a ^ o
            },
            m = function(e, i, t) {
                return e & i | ~e & t
            },
            f = function(e, i, t) {
                return e & t | i & ~t
            },
            g = function(e, i, t) {
                return e ^ i ^ t
            },
            J = function(e, i, t) {
                return i ^ (e | ~t)
            },
            h = function(e, i, t, n, a, o, r) {
                return e = l(e, l(l(m(i, t, n), a), r)), l(d(e, o), i)
            },
            v = function(e, i, t, n, a, o, r) {
                return e = l(e, l(l(f(i, t, n), a), r)), l(d(e, o), i)
            },
            b = function(e, i, t, n, a, o, r) {
                return e = l(e, l(l(g(i, t, n), a), r)), l(d(e, o), i)
            },
            w = function(e, i, t, n, a, o, r) {
                return e = l(e, l(l(J(i, t, n), a), r)), l(d(e, o), i)
            },
            j = function(e) {
                for (var i, t = e.length, n = t + 8, a = (n - n % 64) / 64, o = 16 * (a + 1), r = Array(o - 1), p = 0, s = 0; t > s;) i = (s - s % 4) / 4, p = s % 4 * 8, r[i] = r[i] | e.charCodeAt(s) << p, s++;
                return i = (s - s % 4) / 4, p = s % 4 * 8, r[i] = r[i] | 128 << p, r[o - 2] = t << 3, r[o - 1] = t >>> 29, r
            },
            y = function(e) {
                var i, t, n = "",
                    a = "";
                for (t = 0; 3 >= t; t++) i = e >>> 8 * t & 255, a = "0" + i.toString(16), n += a.substr(a.length - 2, 2);
                return n
            },
            k = Array(),
            P = 7,
            S = 12,
            C = 17,
            I = 22,
            E = 5,
            W = 9,
            N = 14,
            _ = 20,
            D = 4,
            T = 11,
            L = 16,
            O = 23,
            U = 6,
            M = 10,
            B = 15,
            R = 21;
        for (e = u(e), k = j(e), r = 1732584193, p = 4023233417, s = 2562383102, c = 271733878, i = 0; i < k.length; i += 16) t = r, n = p, a = s, o = c, r = h(r, p, s, c, k[i + 0], P, 3614090360), c = h(c, r, p, s, k[i + 1], S, 3905402710), s = h(s, c, r, p, k[i + 2], C, 606105819), p = h(p, s, c, r, k[i + 3], I, 3250441966), r = h(r, p, s, c, k[i + 4], P, 4118548399), c = h(c, r, p, s, k[i + 5], S, 1200080426), s = h(s, c, r, p, k[i + 6], C, 2821735955), p = h(p, s, c, r, k[i + 7], I, 4249261313), r = h(r, p, s, c, k[i + 8], P, 1770035416), c = h(c, r, p, s, k[i + 9], S, 2336552879), s = h(s, c, r, p, k[i + 10], C, 4294925233), p = h(p, s, c, r, k[i + 11], I, 2304563134), r = h(r, p, s, c, k[i + 12], P, 1804603682), c = h(c, r, p, s, k[i + 13], S, 4254626195), s = h(s, c, r, p, k[i + 14], C, 2792965006), p = h(p, s, c, r, k[i + 15], I, 1236535329), r = v(r, p, s, c, k[i + 1], E, 4129170786), c = v(c, r, p, s, k[i + 6], W, 3225465664), s = v(s, c, r, p, k[i + 11], N, 643717713), p = v(p, s, c, r, k[i + 0], _, 3921069994), r = v(r, p, s, c, k[i + 5], E, 3593408605), c = v(c, r, p, s, k[i + 10], W, 38016083), s = v(s, c, r, p, k[i + 15], N, 3634488961), p = v(p, s, c, r, k[i + 4], _, 3889429448), r = v(r, p, s, c, k[i + 9], E, 568446438), c = v(c, r, p, s, k[i + 14], W, 3275163606), s = v(s, c, r, p, k[i + 3], N, 4107603335), p = v(p, s, c, r, k[i + 8], _, 1163531501), r = v(r, p, s, c, k[i + 13], E, 2850285829), c = v(c, r, p, s, k[i + 2], W, 4243563512), s = v(s, c, r, p, k[i + 7], N, 1735328473), p = v(p, s, c, r, k[i + 12], _, 2368359562), r = b(r, p, s, c, k[i + 5], D, 4294588738), c = b(c, r, p, s, k[i + 8], T, 2272392833), s = b(s, c, r, p, k[i + 11], L, 1839030562), p = b(p, s, c, r, k[i + 14], O, 4259657740), r = b(r, p, s, c, k[i + 1], D, 2763975236), c = b(c, r, p, s, k[i + 4], T, 1272893353), s = b(s, c, r, p, k[i + 7], L, 4139469664), p = b(p, s, c, r, k[i + 10], O, 3200236656), r = b(r, p, s, c, k[i + 13], D, 681279174), c = b(c, r, p, s, k[i + 0], T, 3936430074), s = b(s, c, r, p, k[i + 3], L, 3572445317), p = b(p, s, c, r, k[i + 6], O, 76029189), r = b(r, p, s, c, k[i + 9], D, 3654602809), c = b(c, r, p, s, k[i + 12], T, 3873151461), s = b(s, c, r, p, k[i + 15], L, 530742520), p = b(p, s, c, r, k[i + 2], O, 3299628645), r = w(r, p, s, c, k[i + 0], U, 4096336452), c = w(c, r, p, s, k[i + 7], M, 1126891415), s = w(s, c, r, p, k[i + 14], B, 2878612391), p = w(p, s, c, r, k[i + 5], R, 4237533241), r = w(r, p, s, c, k[i + 12], U, 1700485571), c = w(c, r, p, s, k[i + 3], M, 2399980690), s = w(s, c, r, p, k[i + 10], B, 4293915773), p = w(p, s, c, r, k[i + 1], R, 2240044497), r = w(r, p, s, c, k[i + 8], U, 1873313359), c = w(c, r, p, s, k[i + 15], M, 4264355552), s = w(s, c, r, p, k[i + 6], B, 2734768916), p = w(p, s, c, r, k[i + 13], R, 1309151649), r = w(r, p, s, c, k[i + 4], U, 4149444226), c = w(c, r, p, s, k[i + 11], M, 3174756917), s = w(s, c, r, p, k[i + 2], B, 718787259), p = w(p, s, c, r, k[i + 9], R, 3951481745), r = l(r, t), p = l(p, n), s = l(s, a), c = l(c, o);
        var H = y(r) + y(p) + y(s) + y(c);
        return H.toLowerCase()
    }
};
if (tempJeapie) {
    var isInit = !1,
        e;
    for (item in tempJeapie) in_array("init", tempJeapie[item]) && (isInit = !0, 0 != item && (e = tempJeapie[0], tempJeapie[0] = tempJeapie[item], tempJeapie[item] = e));
    isInit || Jeapie.push(["init"]), Jeapie.processPushes(tempJeapie)
}