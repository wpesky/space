(function () {
    pageEdit = function (path) {
        var form = document.forms[0]
        var button = form.querySelector('button')
        onresize = function () {
            var fillerDiv = document.getElementById('fill')
            var outerDiv = document.getElementById('box')
            var rulerDiv = document.getElementById('ruler')
            fillerDiv.style.height = rulerDiv.getBoundingClientRect().height - outerDiv.getBoundingClientRect().height + fillerDiv.getBoundingClientRect().height + 'px'
        }
        onload = function () {
            dispatchEvent(new Event('resize')) // to trigger both onresize and codemirror's resize handling
        }
		var saved = formData(form)
		onbeforeunload = function () {
            if(editor)
                form.elements['contents'].value = editor.getValue()
			if(formData(form) != saved)
				return 'Your changes will not be saved.'
		}
		var editor
        form.onsubmit = function () {
            if(button.className)
                return false
            if(editor)
                form.elements['contents'].value = editor.getValue()
            var post = formData(this)
			go(location.search, button, post, function () {
				saved = post
				var iframe = document.querySelector('iframe')
				if(iframe) {
				    iframe.src = self.THE_PREVIEW || 'list'
				}
				setTimeout(function () {
				    button.className = ''
				}, 500)
			})
            return false
        }
        document.write('<style type="text/css">@import url(/codemirror/lib/codemirror.css);</style>')
        document.write('<script src="/codemirror/lib/codemirror.js"></script>')
        var options = { }
        options.lineNumbers = true
        options.extraKeys = {
            'Ctrl-S': function () { form.onsubmit() },
            'Ctrl-Enter': function () { form.onsubmit() },
            'Ctrl-Space': 'autocomplete',
            'Ctrl-F': 'find',
            'F3': 'findNext',
            'Shift-F3': 'findPrev',
            'Ctrl-H': 'replace',
            'Shift-Ctrl-H': 'replaceAll',
        }
        options.tabSize = 4
        options.indentUnit = 4
        options.indentWithTabs = true
        options.autofocus = true
        options.lineWrapping = true
        if(path.match(/\.js$/)) {
            document.write('<script src="/codemirror/mode/javascript/javascript.js"></script>')
            
            document.write('<style type="text/css">@import url(/codemirror/addon/hint/show-hint.css);</style>')
            document.write('<script src="/codemirror/addon/hint/show-hint.js"></script>')
            document.write('<script src="/codemirror/addon/hint/javascript-hint.js"></script>')
            options.mode = { name: 'javascript', globalVars: true }
            
            document.write('<style type="text/css">@import url(/codemirror/addon/fold/foldgutter.css);</style>')
            document.write('<script src="/codemirror/addon/fold/foldcode.js"></script>')
            document.write('<script src="/codemirror/addon/fold/foldgutter.js"></script>')
            document.write('<script src="/codemirror/addon/fold/brace-fold.js"></script>')
            document.write('<script src="/codemirror/addon/fold/comment-fold.js"></script>')
            options.foldGutter = true
            options.gutters = [ 'CodeMirror-linenumbers', 'CodeMirror-foldgutter' ]
            options.extraKeys['Ctrl-Q'] = function(cm) { cm.foldCode(cm.getCursor()) }
            
        } else if(path.match(/\.css$/)) {
            document.write('<script src="/codemirror/mode/css/css.js"></script>')
            
            document.write('<style type="text/css">@import url(/codemirror/addon/fold/foldgutter.css);</style>')
            document.write('<script src="/codemirror/addon/fold/foldcode.js"></script>')
            document.write('<script src="/codemirror/addon/fold/foldgutter.js"></script>')
            document.write('<script src="/codemirror/addon/fold/brace-fold.js"></script>')
            document.write('<script src="/codemirror/addon/fold/comment-fold.js"></script>')
            options.foldGutter = true
            options.gutters = [ 'CodeMirror-linenumbers', 'CodeMirror-foldgutter' ]
            options.extraKeys['Ctrl-Q'] = function(cm) { cm.foldCode(cm.getCursor()) }
            
        } else if(path.match(/\.html?$/)) {
            document.write('<script src="/codemirror/mode/htmlmixed/htmlmixed.js"></script>') // this goes first
            document.write('<script src="/codemirror/mode/xml/xml.js"></script>')
            document.write('<script src="/codemirror/mode/javascript/javascript.js"></script>')
            document.write('<script src="/codemirror/mode/css/css.js"></script>')
            
            document.write('<script src="/codemirror/addon/hint/show-hint.js"></script>')
            document.write('<script src="/codemirror/addon/hint/javascript-hint.js"></script>')
            
            document.write('<style type="text/css">@import url(/codemirror/addon/fold/foldgutter.css);</style>')
            document.write('<script src="/codemirror/addon/fold/foldcode.js"></script>')
            document.write('<script src="/codemirror/addon/fold/foldgutter.js"></script>')
            document.write('<script src="/codemirror/addon/fold/xml-fold.js"></script>')
            document.write('<script src="/codemirror/addon/fold/comment-fold.js"></script>')
            options.foldGutter = true
            options.gutters = [ 'CodeMirror-linenumbers', 'CodeMirror-foldgutter' ]
            options.extraKeys['Ctrl-Q'] = function(cm) { cm.foldCode(cm.getCursor()) }
            
        } else
            options.mode = null
            
        document.write('<style type="text/css">@import url(/codemirror/addon/dialog/dialog.css);</style>')
        document.write('<style type="text/css">@import url(/codemirror/addon/search/matchesonscrollbar.css);</style>')
        document.write('<script src="/codemirror/addon/dialog/dialog.js"></script>')
        document.write('<script src="/codemirror/addon/search/searchcursor.js"></script>')
        document.write('<script src="/codemirror/addon/search/search.js"></script>')
        document.write('<script src="/codemirror/addon/scroll/annotatescrollbar.js"></script>')
        document.write('<script src="/codemirror/addon/search/matchesonscrollbar.js"></script>')
            
        document.write('<script>readyEdit()</script>')
        readyEdit = function () {
            editor = CodeMirror.fromTextArea(form.elements['contents'], options)
        }
    }
    pageMain = function () {
        handleGenerics()
    }
    pageLogin = function () {
        var form = document.forms[0]
        var status = form.querySelector('#status')
        var button = form.elements[2]
        var user = form.elements[0]
        var pass = form.elements[1]
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
            ajax('login-go', formData(form), function (o) {
                if(o['whoops']) {
                    button.className = ''
                    status.innerHTML = htmlE(o['whoops'])
                    status.style.color = '#c00'
                } else {
                    button.className = 'thanks'
                    status.innerHTML = 'Please wait...'
                    status.style.color = '#080'
                    location = location.hash.substring(1) || 'main'
                }
            })
        }
        var table = document.querySelector('table')
        var timer = setTimeout(function () {
            table.style.opacity = .5
        }, 5000)
        ajax('login-check', function (o) {
            clearTimeout(timer)
            if(o['whoops'])
                table.style.opacity = .5
            else if(o['in'])
                location = location.hash.substring(1) || 'main'
            else
                table.style.opacity = 1
        })
    }
    pagePass = function () {
        var form = document.forms[0]
        var button = form.querySelector('button')
        form.onsubmit = function () {
            if(button.className)
                return false
            button.className = 'hold'
            ajax(location.pathname, formData(form), function (o) {
                if(o['whoops']) {
                    button.className = 'whoops'
                    alert(o['whoops'])
                    button.className = ''
                } else {
                    button.className = 'thanks'
                    setTimeout(function () {
                        location = 'main'
                    }, 500)
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
    function handleGenerics() {
        var logout = document.querySelector('header>div>a')
        if(logout)
            logout.onclick = function () {
                var a = this
                ajax('logout', function (o) {
                    if(o['whoops']) {
                        a.style.color = '#c00'
                        alert(o['whoops'])
                        a.style.color = ''
                    } else {
                        a.style.color = '#080'
                        location = 'login'
                    }
                })
            }
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
		function jsonP(_) {
			try {
				return window.JSON && JSON.parse ? JSON.parse(_) : eval('(' + _ + ')')
			} catch(ex){
				return null
			}
		}
	}
	function htmlE(x) {
		return x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/^ | $|( ) /mg, '$1&nbsp;').replace(/\n|\r\n?/g, '<br/>')
	}
})()