var uuid = require('uuid-v4');

/**
 * Flight.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        flightCode: {
            type: 'text',
            defaultsTo: function() {
                return uuid.call();
            },
            required: true
        },
        departureDate: {
            type: 'datetime',
            required: true
        },
        arrivalDate: {
            type: 'datetime',
            required: true
        },
        flightState: {
            type: "string",
            enum: ["ontime", "delayed", "cancelled"],
            defaultsTo: "ontime",
            required: true
        },
        departureAirport: {
            model: 'airport',
            required: true
        },
        arrivalAirport: {
            model: 'airport',
            required: true
        },
        seats: {
            collection: 'seat',
            via: 'flights',
            dominant: true
        }
    },


    validateForm: function(param) {

        var departureAirport = param.departure;
        var arrivalAirport = param.arrival;
        var tripOption = param.optionsRadios;
        var seatAdult = parseInt(param.seats);
        var seatChild = parseInt(param.seatschild);
        var seatToddler = parseInt(param.seatstod);
        var flightDeparture = new Date(param.startDate);
        var flightArrival = new Date(param.endDate);
        var totalseats = seatAdult + seatChild;

        var errorsMsg = [];

        if (departureAirport == arrivalAirport) {
            errorsMsg.push('Los aeropuertos de partida y destino no pueden ser los mismos');
        }
        /*if (flightDeparture < new Date() || flightArrival < new Date()) {
            errorsMsg.push('La fecha de salida y llegada no pueden ser menores a la fecha actual');
        }
        if (flightDeparture >= flightArrival) {
            errorsMsg.push('La fecha de partida no puede ser mayor a la de llegada')
        }*/
        if (isNaN(seatAdult)) {
            errorsMsg.push('EL numero de asientos no es valido');
        }
        if (totalseats <= 0) {
            errorsMsg.push('Al menos un ticket debe ser seleccionado');
        }
        if (seatToddler>seatAdult){
            errorsMsg.push('No puede viajar con más bebes que adultos');
        }
        Airport.findOne({
            code: departureAirport
        }).exec(function(err, depairport) {
            if (err) {
                errorsMsg.push('No se encontro un aeropuerto de salida con ese codigo');
            }
            if (depairport) {
                Airport.count({
                    where: {
                        code: arrivalAirport,
                        city: depairport.city
                    }
                }).exec(function(err, arrairport) {
                    if (arrairport > 0) {
                        errorsMsg.push('Ambos aeropuertos estan en la misma ciudad');
                    }
                })
            }
        })

        return errorsMsg;
    }
};
