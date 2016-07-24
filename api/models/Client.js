/**
 * Client.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        firstName: {
            type: 'string',
            size: 128,
            required: true
        },
        lastName: {
            type: 'string',
            size: 128,
            required: true
        },
        passportId: {
            type: 'string',
            size: 30,
            required: true
        },
        phoneNumber: {
            type: 'string',
            size: 20,
            required: true
        },
        email: {
            type: 'string',
            email: 'true',
        },
        age: {
            type:'integer',
            required: true
        },
        handicap: {
            type: 'float',
            required: true
        },
        reservations: {
            collection: 'reservation',
            via: 'owner'
        }
    }
};
