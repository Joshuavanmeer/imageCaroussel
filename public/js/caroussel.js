var caroussel = (function(w,d){

    'use strict';

    function create(prefs) {

        var arrowLeft, arrowRight, caroussel, carousselContainer,
            carousselControls, slideContainer, state, sliderCollection;

        arrowLeft = d.getElementById('arrow-left');
        arrowRight = d.getElementById('arrow-right');
        caroussel = d.getElementById('caroussel');
        carousselContainer = d.getElementById('caroussel-container');
        carousselControls = d.getElementById('caroussel-controls');
        slideContainer = d.getElementById('slide-container');


        //private config based on prefs
        state = {
            speed: prefs.speed,
            width: getWidth(),
            activeSlide: 0,
            totalSlides: 0,
            touchStartX: 0,
            touchEndX: 0
        },

        //collection of slides with data
        sliderCollection = {
            slides: [],
            //return the id of the active slide
            getActive: function() {
                var active = this.slides.filter(function(elem) {
                    return elem.active === true;
                });
                return active[0].id;
            },

            //update slide.active state to true or false
            updateActive: function(newActive) {
                this.slides.forEach(function(elem, i, arr) {
                    if (elem.id === newActive && newActive < arr.length) {
                    elem.active = true;
                    }
                    else elem.active = false;
                });
            }
        };

        bootCaroussel();

        //build caroussel UI based on preferences stored in configs
        function bootCaroussel() {
            assignEventListeners(carousselContainer, 'addEventListener', ['click', 'touch'], handleEvent);
            assignEventListeners(carousselContainer, 'addEventListener', ['touchstart', 'touchend'], handleMove);
            assignEventListeners(w, 'addEventListener', ['resize'], handleResize);
            slideContainer.style.transition = 'all ' + state.speed + 's';
        }


        //assign UI listeners and callbacks
        function assignEventListeners(elem, method, actions, fn) {
            actions.forEach(function(action) {
                elem[method](action, function(ev) {
                    fn(ev);
                }, false);
            });
        }


        function handleEvent(ev) {
            var target = ev.target;

            if (target.id === 'arrow-right' && state.activeSlide !== (state.totalSlides - 1)) {
                moveSlide(state.activeSlide + 1);
            }
            else if (target.id === 'arrow-left' && state.activeSlide !== 0) {
                moveSlide(state.activeSlide - 1);
            } else if (target.id.indexOf('UI-pin-') !== -1) {
                var id = target.id.replace('UI-pin-', '');
                moveSlide('', Number(id));
            }
        }


        //if screen is resized update state with new widths,
        //rerender the slides and calculate new move distance
        function handleResize(ev) {
            state.width = getWidth();
            renderSlides(state.totalSlides);
        }


        function handleMove(ev) {
            var touchX = ev.changedTouches[0].clientX;

            switch (ev.type) {
                case 'touchstart':
                    state.touchStartX = touchX;
                    break;
                case 'touchend':
                    state.touchEndX = touchX;

                    if (Math.abs(state.touchStartX - state.touchEndX) > 100 &&
                        state.touchStartX - state.touchEndX > 0) {
                            moveSlide('right', state.activeSlide + 1);
                    }
                    else if (Math.abs(state.touchStartX - state.touchEndX) > 100 &&
                        state.touchStartX - state.touchEndX < 0) {
                            moveSlide('left', state.activeSlide - 1);
                    }
                    break;

            }
        }




        function moveSlide(direction, slots) {
            if ((direction === 'right' && state.activeSlide !== (state.totalSlides - 1)) ||
                (direction === 'left' && state.activeSlide !== 0)) {
                slideContainer.style = '-' + (slots * state.width) + 'px';
            }
            else if (!direction) {
                slideContainer.style = '-' + (slots * state.width) + 'px';
            }
            //update active state on sliderCollection and apply change to state
            sliderCollection.updateActive(slots);
            state.activeSlide = sliderCollection.getActive();
            initChange();
        }



        //change state
        function initChange() {
            renderArrowUI();
            renderPinsUI(sliderCollection.slides);
            renderSlides(state.totalSlides);
        }


        //build pinsUI after slies are added through API
        function buildPinsUI(total) {
            var pinElem, button, domFrag;
            domFrag = d.createDocumentFragment();

            for (var i = 0; i < total; i++) {
                pinElem = d.getElementById('pin-control');
                button = document.createElement('button');
                button.className = 'pin';
                button.id = 'UI-pin-' + i;
                domFrag.appendChild(button);
            }
            pinElem.appendChild(domFrag);
        }


        //update pinsUI background color
        function renderPinsUI(slidesObj) {
            slidesObj.forEach(function(elem, i, arr) {
                if (arr[i].active) {
                    var pin = d.getElementById('UI-pin-' + i);
                    pin.style.background = 'red';
                    pin.style.width = '40px'
                    pin.style.height = '40px';
                    pin.style.borderRadius = '30px';
                    pin.style.cursor = 'default';
                } else if (!arr[i].active) {
                    var pin = d.getElementById('UI-pin-' + i);
                    pin.style.background = 'yellow';
                    pin.style.cursor = 'pointer';
                    pin.style.width = '30px';
                    pin.style.height = '30px';
                }
            });
        }


        //after UI input rerender the
        //arrow controls appearance
        function renderArrowUI() {
            var activeSlide, lastSlide;
            activeSlide = state.activeSlide;
            lastSlide = state.totalSlides - 1;

            if(activeSlide === 0) {
                arrowLeft.style.background = 'grey';
                arrowLeft.style.cursor = 'default';
                arrowRight.style.background = 'red';
                arrowRight.style.cursor = 'pointer'
            } else if (activeSlide === lastSlide) {
                arrowLeft.style.background = 'red';
                arrowLeft.style.cursor = 'pointer';
                arrowRight.style.background = 'grey';
                arrowRight.style.cursor = 'default';
            } else if (activeSlide !== 0 && lastSlide !== 0) {
                arrowLeft.style.background = 'red';
                arrowLeft.style.cursor = 'pointer';
                arrowRight.style.background = 'red';
                arrowRight.style.cursor = 'pointer';
            }
        }


        //when slide is added construct HTML for
        //new slide and corresponding UI pin.
        function addSlide(slideData) {
            buildSlideData(slideData, sliderCollection.slides);
            buildSlide(slideData, sliderCollection.slides, state.totalSlides);
            buildPinsUI(state.totalSlides);
            initChange();
        }


        //Update the slide collection with slide Obj
        //containing data and corresponding data.
        //Default slide.active for first slide is active
        function buildSlideData(slideData, collection) {
            slideData.forEach(function(name, i) {
                collection.push({
                    url: name.url,
                    desc: name.desc,
                    active: state.totalSlides === 0 ? true : false,
                    id: state.totalSlides
                });
                state.totalSlides++;
            });
        }

        //construct HTML for each slide after
        //being added through API
        function buildSlide(slideData, collection){
            var slideElem, slideImg, domFrag;
            domFrag = d.createDocumentFragment();

            collection.forEach(function(elem) {
                slideElem = d.createElement('div');
                slideImg = d.createElement('img');

                slideElem.className = 'slide';
                slideImg.setAttribute('src', elem.url);
                slideElem.appendChild(slideImg);
                domFrag.appendChild(slideElem);
            });
            slideContainer.appendChild(domFrag);
        }


        function renderSlides(totalSlides) {
            var slides, width;
            slides = d.getElementsByClassName('slide');
            width = state.width;

            slideContainer.style.width = (totalSlides * width + 'px');
            for (var i = 0; i < slides.length; i++) {
                slides[i].style.width = (width)+ 'px';
            }
        }


        //retrieve the possibly dynamic width
        function getWidth() {
            return caroussel.offsetWidth;
        }


        return {
            addSlide: addSlide,
            initChange: initChange
        }

    }


    return {
        create: create
    };


}(window, document));