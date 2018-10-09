
var button = document.querySelector('#start-button');
var output = document.querySelector('#output');

button.addEventListener('click', function() {
  output.textContent = '';

  // var promise = new Promise(function(resolve, reject) {
  //   setTimeout(function() {
  //     resolve('https://swapi.co/api/people/1');
  //   }, 3000);
  // });
  //
  // promise.then(function(url) {
  //   console.log('Resolved ', url);
  //   return fetch(url);
  // })
  // .then(function(response) {
  //   console.log('Received response');
  //   return response.json();
  // })
  // .then(function(data) {
  //   console.log(data);
  //   output.textContent = data.name;
  // });

  // Repeat the exercise with a PUT request you send to https://httpbin.org/put
  // fetch('https://httpbin.org/put', {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     name: 'Jake', familyName: 'the Fake', age: 15
  //   })
  // })
  // .then(function(response) {
  //   console.log('PUT response', response);
  //   return response.json();
  // })
  // .then(function(data) {
  //   console.log(data);
  //   output.textContent = data.json.name + ' ' + data.json.familyName;
  // });

  // To finish the assignment, add an error to URL and add handle the error both as
  // a second argument to then() as well as via the alternative taught in the module
  fetch('https://httpbin.org/fut', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name: 'Jake', familyName: 'the Fake', age: 15
    })
  })
  .then(function(response) {
    console.log('PUT response', response);
    return response.json();
  })
  .catch(function(err) {
    console.log('ERROR! ' + err)
  })
  .then(function(data) {
    console.log(data);
    output.textContent = data.json.name + ' ' + data.json.familyName;
  })
  .catch(function(err) {
    console.log('ERROR! ' + err)
  });

});
