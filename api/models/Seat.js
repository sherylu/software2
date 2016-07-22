/**
 * Seat.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        seatNumber: {
            type: 'integer',
            required: true,
            unique: true
        },
        available: {
            type: 'boolean',
            defaultsTo: true,
            required: true
        },
        seatType: {
            type: 'string',
            enum: ["firstClass", "tourist"],
        },
        location: {
            type: 'string',
            enum: ["window", "middle", "hallway"],
            required: true
        },
        flights: {
            collection: 'flight',
            via: 'flightCode'
        }
    }
};
