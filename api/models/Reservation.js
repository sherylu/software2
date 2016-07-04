/**
 * Reservation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    quantity: {
      type: 'integer',
      required: true
    },
    state: {
      type: 'string',
      enum: ["Payment Pending", "Payed", "Cancelled"],
      defaultsTo: "Payment Pending",
      required: true
    },
    creationDate: {
      type: 'datetime',
      required: true
    },
    code: {
      type: 'integer',
      autoIncrement: true
    },
    owner: {
      model: 'client'
    }
  }
};

