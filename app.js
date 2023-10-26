// Variables
let map;
let originMarker;
let destinationMarker;
let directionsService;
let directionsRenderer;
let placesService;
let selectedDestinations = [];
let markers = [];
let locationNumber = 1;

//The cool intro 
let intro = document.querySelector('.intro');
let logo = document.querySelector('logo.header');
let logoSpan = document.querySelectorAll('.logo');

window.addEventListener('DOMContentLoaded', ()=>{

    setTimeout(()=>{

        logoSpan.forEach((span, idx)=>{
            setTimeout(()=>{
                span.classList.add('active');
            }, (idx + 1) * 400)
        });


        setTimeout(()=>{
            logoSpan.forEach((span, idx)=>{
                setTimeout(()=>{
                    span.classList.remove('active');
                    span.classList.add('fade');
                }, (idx + 1) * 50)
            })
        },2000);

        setTimeout(()=>{
            intro.style.top =  '-100vh'
        },2300)
    })
})

/*
//login
function setFormMessage(formElement, type, message){
    const messageElement = formElement.querySelector('form__message');

    messageElement.textContent = message;
    messageElement.classList.remove('form__message--success', 'form__message--error');
    messageElement.classList.add('form__message--${type}');
}

function setInputError(inputElement, message) {
    inputElement.classList.add('form__input--error');
    inputElement.parentElement.querySelector('.form__input-error-message').textContent = message;
}

function clearInputError(inputElement){
    inputElement.classList.remove('form__input--error');
    inputElement.parentElement.querySelector('.form__input-error-message').textContent = "";
}

document.addEventListener('DOMContentLoaded', () =>{
    const loginForm = document.querySelector('#login');
    const createAccountForm = document.querySelector('#createAccount');

    document.querySelector('#linkCreateAccount').addEventListener('click', e => {
        e.preventDefault
        loginForm.classList.add('form--hidden');
        createAccountForm.classList.remove('form--hidden');
    });

    document.querySelector('#linkLogin').addEventListener('click', e => {
        e.preventDefault
        loginForm.classList.remove('form--hidden');
        createAccountForm.classList.add('form--hidden');
    });

    loginForm.addEventListener('submit', e => {
        e.preventDefault

            //ajax/fetch

        setFormMessage(loginForm, "error", "Invalid Username/Password Combination");
    });

    document.querySelectorAll('.form__input').forEach(inputElement =>{
        inputElement.addEventListener("blur", e => {
            if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 10) {
                setInputError(inputElement, "Username must be at least 10 characters in length");
            }
        });
        inputElement.addEventListener('input', e => {
            clearInputError(inputElement);
        })
    });
});
*/


    (function() {
        // Make the destination list sortable
        ("#destination-list").sortable();
        // Update the order of the destinations when the user stops dragging
        ("#destination-list").on("sortstop", function(event, ui) {
            // Get the updated order
            const order = $(this).sortable("toArray");
            console.log("Updated order:", order);
        });
    });

    const sortable = new Sortable(destination-list, {
        animation: 150,
        onEnd: function (evt) {
            // Implement the logic to update the order of selected destinations
            // based on the user's drag-and-drop actions
        },
    });

// Function to initialize the map and other components
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 3
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    placesService = new google.maps.places.PlacesService(map);

    map.addListener('click', function(event) {
        handleMapClick(event.latLng);
    });
}

// Function to search for a location and add a marker
function searchLocation(inputFieldId) {
    const inputField = document.getElementById(inputFieldId);
    const location = inputField.value;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, function(results, status) {
        if (status === 'OK' && results[0].geometry.location) {
            const locationCoordinates = results[0].geometry.location;
            clearMarkers();
            const marker = new google.maps.Marker({
                position: locationCoordinates,
                map: map
            });
            map.setCenter(locationCoordinates);
            markers.push(marker);
        }
    });
}

// Function to clear markers from the map
function clearMarkers() {
    if (originMarker) {
        originMarker.setMap(null);
    }

    if (destinationMarker) {
        destinationMarker.setMap(null);
    }

    for (let marker of markers) {
        marker.setMap(null);
    }

    originMarker = null;
    destinationMarker = null;
    markers = [];
}

// Function to handle map clicks and add markers for destinations
function handleMapClick(location) {
    if (originMarker) {
        originMarker.setMap(null);
    }

    if (destinationMarker) {
        destinationMarker.setMap(null);
    }

    const marker = new google.maps.Marker({
        position: location,
        map: map
    });

    if (!originMarker) {
        originMarker = marker;
    } else {
        destinationMarker = marker;

        placesService.nearbySearch({
            location: location,
            radius: 1000,
            type: ['tourist_attraction']
        }, function(results, status) {
            if (status === 'OK' && results.length > 0) {
                results.forEach(function(place) {
                    const placeMarker = new google.maps.Marker({
                        position: place.geometry.location,
                        map: map,
                        title: place.name
                    });

                    placeMarker.addListener('click', function() {
                        addDestination(place);
                    });
                });
            }
        });
    }
}

// Function to calculate the distance between two locations
function calculateDistance() {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const distanceDisplay = document.getElementById('distance');

    const origin = originInput.value;
    const destination = destinationInput.value;

    const request = {
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            const route = response.routes[0];
            const distance = route.legs[0].distance.text;
            distanceDisplay.textContent = `Distance: ${distance}`;
        } else {
            distanceDisplay.textContent = 'Unable to calculate distance.';
        }
    });
}

// Function to calculate the route with selected destinations
function calculateRoute() {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const distanceDisplay = document.getElementById('distance');

    const origin = originInput.value;
    const destination = destinationInput.value;

    const request = {
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING',
        waypoints: selectedDestinations.map(place => ({
            location: place.geometry.location,
            stopover: true
        }))
    };

    directionsService.route(request, function(response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
            const route = response.routes[0];
            const distance = route.legs[0].distance.text;
            distanceDisplay.textContent = `Distance: ${distance}`;
        } else {
            distanceDisplay.textContent = 'Unable to calculate route.';
        }
    });
}

// Function to select a destination and add it to the route
function selectDestination(index) {
    if (index >= 0 && index < selectedDestinations.length) {
        const destination = selectedDestinations[index];
        selectedDestinations.splice(index, 1);
        const destinationList = document.getElementById('destination-list');
        destinationList.removeChild(destinationList.childNodes[index]);
        calculateRoute();
    }
}

// Function to add a destination to the list
function addDestination(place) {
    selectedDestinations.push(place);
    const destinationList = document.getElementById('destination-list');
    const destinationItem = document.createElement('li');
    destinationItem.textContent = place.name;
    const selectButton = document.createElement('button');
    selectButton.textContent = 'Select';
    selectButton.addEventListener('click', function() {
        const index = selectedDestinations.indexOf(place);
        if (index !== -1) {
            selectDestination(index);
        }
    });
    destinationItem.appendChild(selectButton);
    destinationList.appendChild(destinationItem);
    calculateRoute();
}
(function() {
    // Make the destination list sortable
    $("#destination-list").sortable();
    // Update the order of the destinations when the user stops dragging
    $("#destination-list").on("sortstop", function(event, ui) {
        // Get the updated order
        const order = $(this).sortable("toArray");
        console.log("Updated order:", order);
    });
})();
// New function to add a new destination
function addNewDestination() {
    const newDestinationInput = document.getElementById('new-destination');
    const newDestinationName = newDestinationInput.value.trim();
    if (newDestinationName !== '') {
        // Increment the location number
        locationNumber++;
        
        const newDestination = {
            name: newDestinationName,
            geometry: { location: map.getCenter() }
        };
        addDestination(newDestination);
        newDestinationInput.value = '';
    }
}