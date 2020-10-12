function id(id){return document.getElementById(id)}

// Переключение полного экрана и обычного
function fullScreenSwitch(){
	if (id('rating-block').style.position == 'absolute') normalScreen()
	else fullScreen()
}
fullscreen = false
window.onresize = function(){
	if (!fullscreen) normalScreen()
	else fullScreen()
}

// Обычный экран
function normalScreen(){

	window.onpopstate = function(){return}

	fullscreen = false
	localStorage.setItem('fullscreen', '0')
	
	id('rating-block').style.position = 'relative'
	id('date-block').style.position  = 'relative'
	id('rating-table').style.position  = 'relative'

	id('header').style.opacity = '1'
	id('selectors-block').style.opacity = '1'

	id('close-fullscreen').style.display = 'none'
	id('open-fullscreen').style.display  = 'block'

	id('rating-table').style.left = '0'
	id('rating-block').style.left  = '0'
	id('rating-block').style.top  = '0'

	if (window.innerHeight > window.innerWidth){
		id('date-block').style.width  = '90vw'
		id('date-table').style.width  = 'calc(90vw - 86px)'

		id('rating-block').style.width  = '90vw'
		id('rating-block').style.height = '65vh'

		id('rating-table').style.width  = 'calc(90vw - 86px)'
		id('rating-table').style.height = 'calc(65vh - 26px)'

		id('names-table').style.width  = '86px'
		id('names-table').style.height = 'calc(65vh - 26px)'
		id('names-table').style.maxWidth = '86px'
		id('names-table').style.minWidth = '86px'
	}
	else {
		id('date-block').style.width  = '70vw'
		id('date-table').style.width  = 'calc(70vw - 120px)'

		id('rating-block').style.width  = '70vw'
		id('rating-block').style.height = '70vh'

		id('rating-table').style.width  = '70vw'
		id('rating-table').style.height = '70vh'
		
		id('names-table').style.width  = '120px'
		id('names-table').style.height = '70vh'
		id('names-table').style.minWidth = '120px'
		id('names-table').style.maxWidth = '120px'

		id('down-arrow').style.transform = 'scale(1, 1)'
		id('down-arrow').style.top = '0'
		id('header').style.height = '42px'
	}
}

// Полноэкранный режим
function fullScreen(){

	history.pushState({}, '', 'rating');
	window.onpopstate = function(){if (fullscreen) normalScreen()}

	fullscreen = true
	localStorage.setItem('fullscreen', '1')

	id('rating-block').style.position = 'absolute'
	id('date-block').style.position  = 'absolute'
	id('rating-table').style.position  = 'absolute'

	id('header').style.opacity = '0'
	id('selectors-block').style.opacity = '0'

	id('close-fullscreen').style.display = 'block'
	id('open-fullscreen').style.display  = 'none'

	id('date-block').style.top   = '0'
	id('date-block').style.left  = '0'

	if (window.innerHeight > window.innerWidth){
		id('date-block').style.width  = '100vw'
		id('date-table').style.width  = 'calc(100vw - 86px)'

		id('rating-block').style.left = '0'
		id('rating-block').style.top  = '26px'
		id('rating-block').style.width  = 'calc(100vw - 86px)'

		id('rating-table').style.left = '86px'
		id('rating-table').style.width =  'calc(100vw - 86px)'
		id('rating-table').style.height = 'calc(100vh - 26px)'

		id('names-table').style.minWidth  = '86px'
		id('names-table').style.height = 'calc(100vh - 26px)'
		
		for (i of document.getElementsByClassName('student-cell')){
			i.style.minWidth = '86px'
		}

		id('down-arrow').style.transform = 'scale(1, 1)'
		id('down-arrow').style.top = '0'
		id('header').style.height = '42px'
	}
	else {
		id('date-block').style.width  = '100vw'
		id('date-table').style.width  = 'calc(100vw - 120px)'
		
		id('rating-block').style.left = '0'
		id('rating-block').style.top  = '40px'
		id('rating-block').style.width  = 'calc(100vw - 120px)'

		id('rating-table').style.left = '120px'
		id('rating-table').style.width  = 'calc(100vw - 120px)'
		id('rating-table').style.height = 'calc(100vh - 40px)'

		id('names-table').style.minWidth  = '120px'
		id('names-table').style.height = 'calc(100vh - 40px)'

		for (i of document.getElementsByClassName('student-cell')){
			i.style.minWidth = '120px'
		}
	}
}
document.onkeyup = function(event){
	if (event.keyCode == 70) fullScreen()
} 

if (localStorage.getItem('fullscreen') == '1') fullScreen()
