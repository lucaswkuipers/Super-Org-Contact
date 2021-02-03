var app = new Vue({
  el: '#app',
  data: {
    contacts: [],
    isRowActive: false
  },
  methods: {},
  computed: {
    domainContacts() {
      
      let contacts = this.contacts
      
      let domains = {}

      for (let contact of contacts) {
        let domainName = contact.split('@')[1]

        if (!(domainName in domains)) {
          domains[domainName] = []
        }
        domains[domainName].push(contact)
      }
      return domains
    }
  }
})

// TODO: Replace global variable with other method
const emails = []

// Authentication Button
function renderButton() {
    gapi.signin2.render('my-button', {
        'scope': 'email profile https://www.googleapis.com/auth/plus.login', // requesting access to user's profile
        'width': 250,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

/**
  Function is executed when the login is successful
*/
function onSuccess(googleUser) {
    // Recovering user's profile
    var profile = googleUser.getBasicProfile();
    console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    console.log("Name: " + profile.getName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail());
    
    contactEmails();
  
    document.getElementById('my-button').style.display = 'none'
    document.getElementById('login-h2').style.display = 'none'
  
    // Recovering user's token
    // TODO Send info to backend with flask
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
}

/**
  Function is executed when login fails
*/
function onFailure(error) {
    console.log(error);
}

/**
  Function to sign out user
*/
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}

// Gives all contact's emails
function contactEmails() {
  gapi.client.people.people.connections.list({
    'resourceName': 'people/me',
    'pageSize': 100,
    'personFields': 'emailAddresses'
  }).then(function (response) {
    let connections = response.result.connections;

    for (let connection of connections) {
      emails.push(connection.emailAddresses[0].value) // shouldnt be using a global variable, but couldnt get around returning values from promises yet
    }
  }).then(function () {
    app.contacts = emails
    app.contacts = [...new Set(app.contacts)]; // each request sign in was duplicating the list of contacts... that just keeps the unique values
  }).then(function () {
    console.log("Contact list rendered!")

    console.log(emails)
      
    let domains = {}

    for (let email of emails) {
      let domainName = email.split('@')[1]

      if (!(domainName in domains)) {
        domains[domainName] = []
      }
      domains[domainName].push(email)
    }
    
    console.log(domains)

    domain_len = []

    for (let domain of Object.keys(domains)) {
      domain_len.push(domains[domain].length)
    }

    /* FIX CHART NOT SCALLING DOWN CORRECTLY */
    const ctx = document.getElementById('chart').getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(domains),
        datasets: [{
          label: '# of Emails per Domain',
          data: domain_len,
          backgroundColor: [
            'rgb(28, 193, 172)',
            'rgb(127, 206, 110)',
            'rgb(255, 205, 86)'],
          hoverOffset: 4
        }]
      },
      options: {
        maintainAspectRation: false,
        responsive: true
      },
    });



  })
}