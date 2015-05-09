(function () {
    var page
    var hists = history.state ? history.state.idx : 0
    while(hists-- > 0)
        history.back()
    addEventListener('popstate', onstate)
    onstate()
    function onstate() {
        if(page) page.style.display = 'none'
        if(history.state && history.state.area == 'main') {
            pageMain()
        } else {
            pageLogin()
        }
    }
    function pageMain() {
        var cookact = 'cookie=' + encodeURIComponent(history.state.cookie) + '&action='
        var pageHere = page = document.getElementById('pageMain')
        page.style.display = 'block'
        var status = page.querySelector('#mainStatus')
        refresh()
        function refresh() {
            if(pageHere != page) return
            clearTimeout(page.t)
            status.innerHTML = '<div style="color:#c00">Refreshing!!</div>'
            ajax('post', cookact + 'refresh', function (o) {
                if(o['whoops'])
                    status.innerHTML = '<div style="color:#c00">Error Refreshing: ' + o['whoops'] + '</div>'
                else {
                    page.data = o['thanks']
                    status.innerHTML = 'Last Refresh: ' + new Date().toString()
                }
                clearTimeout(page.t)
                page.t = setTimeout(refresh, 10000)
            })
        }
    }
    function pageLogin() {
        var pageBefore = page
        var pageHere = page = document.getElementById('pageLogin')
        page.style.display = 'block'
        var form = page.querySelector('form')
        var button = form.elements[2]
        var user = form.elements[0]
        var pass = form.elements[1]
        var remember = form.elements[3]
        var remembered = jsonP(localStorage[location.pathname + ' remembered'])
        if(remembered) {
            user.value = remembered['user']
            pass.value = remembered['pass']
            remember.checked = true
        }
        var status = form.querySelector('#status')
        user.focus()
        
        form.onsubmit = function () {
            if(button.className)
                return false
            if(!user.value) {
                status.innerHTML = 'Please enter your username.'
                status.style.color = '#c00'
                user.focus()
                return false
            }
            if(!pass.value) {
                status.innerHTML = 'Please enter your password.'
                status.style.color = '#c00'
                pass.focus()
                return false
            }
            button.className = 'hold'
            status.innerHTML = 'Please wait...'
            status.style.color = '#888'
            ajax('post', 'action=login&' + formData(form), function (o) {
                if(o['whoops']) {
                    button.className = ''
                    status.innerHTML = htmlE(o['whoops'])
                    status.style.color = '#c00'
                } else {
                    if(remember.checked)
                        localStorage[location.pathname + ' remembered'] = JSON.stringify({ 'user': user.value, 'pass': pass.value })
                    else
                        delete localStorage[location.pathname + ' remembered']
                    status.innerHTML = ''
                    status.style.color = ''
                    history.pushState({idx:0,area:'main',cookie:o['thanks']}, '', location.pathname + location.search)
                    onstate()
                }
            })
        }
    }
	function go(path, button, data, callback) {
		button.className = 'hold'
		var wait = new Date().getTime() + 100
		ajax(path, data, function (o) {
			wait -= new Date().getTime()
			setTimeout(function () {
				if(o['whoops']) {
					button.className = 'whoops'
					alert(o['whoops'].replace(/\ufffd/g, '\u00a0'))
					button.removeAttribute('class')
				} else if(o['confirm']) {
					button.className = 'confirm'
					if(confirm(o['confirm'])) {
						go(path, button, data + '&confirm=' + encodeURIComponent(o['confirm']), callback)
					} else
						button.removeAttribute('class')
				} else {
					button.className = 'thanks'
					callback(o)
				}
			}, wait < 0 ? 0 : wait)
		})
	}
	function formData(form) {
		var data = ''
		for(var i = 0; i < form.elements.length; i++) {
			var e = form.elements[i]
			if(e.tagName != 'BUTTON' && !e.disabled && e.name && (e.tagName != 'INPUT' || e.type != 'radio' && e.type != 'checkbox' || e.checked))
				if(e.tagName == 'select') {
					for(var j = 0; j < e.options.length; j++)
						if(e.options[j].selected)
							data += '&' + encodeURIComponent(e.name) + '=' + encodeURIComponent(e.options[j].value)
				} else
					data += '&' + encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value)
		}
		return data.substring(1)
	}
	function ajax(url, post, callback, timeout) {
		if(typeof callback != 'function')
			timeout = callback, callback = post, post = ''
		if(!timeout)
			timeout = 1000 * 20
		var timedOut
		var timer = setTimeout(function () {
			timedOut = true
			complete()
			request.abort()
		}, timeout)
		var request = new XMLHttpRequest()
		request.onreadystatechange = function () {
			if(request.readyState == 4 && !timedOut)
				complete(request)
		}
		request.open('POST', url, true)
		request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
		request.send(post)
		return request
		function whoops(whoops) {
			callback({
				'whoops': whoops
			})
		}
		function complete() {
			clearTimeout(timer)
			var success = false
			try {
				var json
				try { var cType = request.getResponseHeader('Content-Type').replace(/\s*;[\s\S]*/, '') } catch(e) {}
				if(timedOut)
					whoops('Connection timeout of ' + (timeout / 1000) + ' seconds.')
				else if(request.status == 200 && cType == 'text/html')
					if(request.responseText.substring(0, 9) == '<!DOCTYPE')
						whoops('You are no longer logged in.')
					else
						callback({'thanks': request.responseText})
				else if(request.status == 200 && (json = jsonP(request.responseText)))
					callback(json)
				else
					whoops(request.status && request.status < 12000 ? 'Received HTTP ' + request.status : 'Internet Connection Failure')
				success = true
			} finally {
				if(!success)
					try {
						whoops('JavaScript Error on ' + url)
					} catch(e) {
						alert('Double JavaScript Error on ' + url)
					}
			}
		}
	}
	function jsonP(_) {
		try {
			return window.JSON && JSON.parse ? JSON.parse(_) : eval('(' + _ + ')')
		} catch(ex){
			return null
		}
	}
	function htmlE(x) {
		return x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/^ | $|( ) /mg, '$1&nbsp;').replace(/\n|\r\n?/g, '<br/>')
	}
})()
