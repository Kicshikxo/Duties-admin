function id(id){return document.getElementById(id)}

// Поднастройка подсветки кнопок навигации
li = document.getElementsByTagName('li')
for (i = 0; i < li.length; i++){
	if (li[i].id != 'current-tab' && li[i].id != 'current-mobile-tab'){
		li[i].ontouchstart = li[i].onmouseover = function(){
			id('current-tab').style.background = 'none'
			id('current-mobile-tab').style.background = 'none'
		}
		li[i].ontouchend = li[i].onmouseleave = function(){
			id('current-tab').style.background    = getComputedStyle(document.documentElement).getPropertyValue('--current-tab-color')
			id('current-mobile-tab').style.background = getComputedStyle(document.documentElement).getPropertyValue('--current-tab-color')
		}
		li[i].onclick = function(){
			for (i = 0; i < li.length; i++){
				li[i].onclick = li[i].ontouchend = li[i].onmouseleave = function(){return}
			}
			this.style.background = getComputedStyle(document.documentElement).getPropertyValue('--current-tab-color')
			id('current-tab').style.background = 'none'
			id('current-mobile-tab').style.background = 'none'
		}
	}
}

// Открытие меню навигации на телефонах
function openMenu(){
	if (id('header').style.height == '33vh') {
		id('down-arrow').style.transform = 'scale(1, 1)'
		id('down-arrow').style.margin = '3px calc(50vw - 18px)'
		id('down-arrow').style.top = '0'
		id('header').style.height = '42px'
	}
	else {
		id('down-arrow').style.transform = 'scale(1, -1)'
		id('down-arrow').style.margin = '0 calc(50vw - 18px)'
		id('down-arrow').style.top = 'calc(33vh - 36px)'
		id('header').style.height = '33vh'
	}
}
