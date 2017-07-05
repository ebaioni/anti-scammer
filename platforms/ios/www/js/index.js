/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {

        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        function onSuccess(contact) {
            alert("Save Success");
        };

        function onError(contactError) {
            alert("Error = " + contactError.code);
        };

        var that = this;
        this.retrievePhoneNumbers().then(function(data) {
            that.updateContact(data);
        });

        console.log('Received Event: ' + id);
    },

    httpCall: function(url) {
        return new Promise(function(resolve, reject) {
            // do a thing, possibly async, then…
            $.get(url, function(data) {
                resolve(data);
            }).fail(function() {
                reject('Unable to retrieve data for ' + url);
            });
        });
    },

    retrievePhoneNumbers: function() {
        return this.httpCall('https://api.myjson.com/bins/eo7pb')
    },

    getContactTemplate: function() {
        var contact = navigator.contacts.create();
        contact.displayName = "Scammer";
        contact.familyName = "Scammer";
        contact.givenName = "Scammer";
        contact.nickname = "Scammer";
        contact.phoneNumbers = [];
        return contact;
    },

    convertPhoneNumbersToContact: function(phoneNumbers) {
        if (!phoneNumbers || phoneNumbers.length === 0) {
            return [];
        }
        var result = [];
        for (var i = 0; i < phoneNumbers.length; i++) {
            result.push(new ContactField('work', phoneNumbers[i], false));
        }

        return result;
    },

    updateContact: function(data) {
        var scammerContact = this.getContactTemplate();
        var options      = new ContactFindOptions();
        scammerContact.phoneNumbers = this.convertPhoneNumbersToContact(data.phone_numbers);
        alert(JSON.stringify(scammerContact));
        options.filter   = scammerContact.displayName;
        options.multiple = false;
        options.desiredFields = [navigator.contacts.fieldType.id, navigator.contacts.fieldType.nickname, navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.phoneNumbers, navigator.contacts.fieldType.familyName, navigator.contacts.fieldType.givenName];

        var fields = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];

        navigator.contacts.find(fields, function(contacts) {
            alert('Found ' + contacts.length + ' contacts.');
            if (!contacts || contacts.length === 0) {
                scammerContact.save(function(){ alert('saved');}, function() {alert("error while saving")});
            } else {
                var existingContact = contacts[0];
                alert('JSON:' + JSON.stringify(existingContact));
                existingContact.remove(function () {
                    alert('Contact Removed');
                    scammerContact.save(function(c) {
                        alert('replaced');
                    }, function(e) {
                        alert('ERROR, '  + e);
                    });
                });
            }
        }, function onError(contactError) {
            alert("Error: please make sure = " + JSON.stringify(contactError));
        }, options);
    }
};
