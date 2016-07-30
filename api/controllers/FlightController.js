/**
 * FlightController
 * @description :: Server-side logic for managing flights
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /* SEARCH */

    search: function (req, res) {

        var departureAirport = req.param('departure');
        var arrivalAirport = req.param('arrival');
        var tripOption = req.param('optionsRadios');
        var seatAdult = parseInt(req.param('seats'));
        var seatChild = parseInt(req.param('seatschild'));
        var seatToddler = parseInt(req.param('seatstod'));
        var flightDeparture = new Date(req.param('startDate'));
        var flightArrival = new Date(req.param('endDate'));
        var seatClass = req.param('fclass');
        var totalseats = seatAdult + seatChild;

        var values = req.allParams();
        var errorsMsg = Flight.validateForm(values);

        if (errorsMsg.length > 0) {
            Airport.find().exec(function (err, allAirports) {
                if (err || allAirports === undefined) {
                    allAirports = [];
                } else {
                    if (req.method === 'GET') {
                        errorsMsg = []
                    }
                    return res.view('homepage', {
                        airports: allAirports,
                        errors: errorsMsg
                    });
                }
            })
        } else {


            Flight
                .find({
                    departureDate: {
                        '>=': flightDeparture
                    }
                }).populate('seats', {
                where: {
                    available: true
                }
            }).populate('departureAirport').populate('arrivalAirport').exec(function (err, departureFlights) {
                if (err) {
                    return res.negotiate(err);
                }
                if (departureFlights === undefined) {
                    errorsMsg.push('No se encontraron vuelos disponibles para la salida')
                    res.view('flight/search', {
                        errors: errorsMsg,
                        departures: [],
                        arrivals: [],
                        oneWay: true,
                        numberOfSeats: [seatAdult, seatChild, seatToddler],
                    });
                } else {
                    console.log("departure flights before filter: " + departureFlights.length);
                    /*departureFlights = departureFlights.filter(function (f) {
                        return f.seats.length > totalseats
                    }).filter(function (f) {
                        return f.departureAirport.code == departureAirport
                    }).filter(function (f) {
                        return f.arrivalAirport.code == arrivalAirport
                    });*/


                    if (tripOption == "option2") {

                        res.view('flight/search', {
                            errors: errorsMsg,
                            departures: departureFlights,
                            arrivals: [],
                            oneWay: true,
                            numberOfSeats: [seatAdult, seatChild, seatToddler]
                        });
                    } else {
                        Flight.find({
                            departureDate: {
                                '>=': flightArrival
                            }
                        }).populate('seats', {
                            where: {
                                available: true
                            }
                        }).populate('departureAirport').populate('arrivalAirport').exec(function (err, returnFlights) {
                            if (err) {
                                return res.negotiate(err);
                            }
                            if (returnFlights === undefined) {
                                errorsMsg.push('No se encontraron vuelos disponibles para el regreso')
                                res.view('flight/search', {
                                    errors: errorsMsg,
                                    departures: departureFlights,
                                    arrivals: [],
                                    oneWay: false,
                                    numberOfSeats: [seatAdult, seatChild, seatToddler]
                                });
                            } else {
                                console.log("Return flights before filter: " + returnFlights.length);
                                /*returnFlights = returnFlights.filter(function (f) {
                                    return f.seats.length > totalseats
                                }).filter(function (f) {
                                    return f.departureAirport.code == arrivalAirport
                                }).filter(function (f) {
                                    return f.arrivalAirport.code == departureAirport
                                });*/
                                
                                res.view('flight/search', {
                                    errors: errorsMsg,
                                    departures: departureFlights,
                                    arrivals: returnFlights,
                                    oneWay: false,
                                    numberOfSeats: [seatAdult, seatChild, seatToddler]
                                });
                            }
                        });

                    }
                }

            });
        }
    },



    /* BOOKING */

    booking: function (req, res) {

        var leavingFlightCode = req.param('selectedRowLeaving');
        var returningFlightCode = req.param('selectedRowReturning');
        var adultSeats = parseInt(req.param('adultSeats'));
        var childSeats = parseInt(req.param('childSeats'));
        var todSeats   = parseInt(req.param('todSeats'));
        var oneWay = req.param('oneWay');
        

        console.log(req.allParams());

        return res.view('flight/bookingflight', {
            errors: [],
            flightCodeLeaving: leavingFlightCode,
            flightCodeReturning: returningFlightCode,
            adultSeats: adultSeats,
            childSeats: childSeats,
            todSeats: todSeats,
            oneWay: oneWay
        });

    },



    /*SENDBOOKINGMAIL*/

    sendbookingmail: function (req, res) {

        var clients = req.param('obj');
        var seats = parseInt(req.param('numberOfSeats'));
        var fligthCodes = req.param('reservation');
        
        console.log('obj:');
        console.log(clients);
        console.log('seats:');
        console.log(seats);
        console.log('reservation');
        console.log(fligthCodes);
        
        var client = clients[0];
        console.log('En metodo final:');
        console.log(client);
        
        
        var reservation = { quantity: seats,
                            creationDate: new Date()
                          }
        
        var reservations = fligthCodes.map(function(code) {
                                var fReservation = reservation;
                                fReservation.flightCode = code;
                                fReservation.code = Math.floor((Math.random() * 1000) + 1);
                                return fReservation; 
                            });
                            
         console.log('RESERVATIONS');
            console.log(reservations);
                            
        clients = clients.map(function(client) {
           var lClient = client;
           lClient.reservations = reservations;
           console.log(lClient.name);
           console.log(lClient.reservations);
           return lClient;
        });
        
        console.log('CLIENTEZs:');
        console.log(clients);
        
        client.subject = 'RESERVA DE VUELO';

        sails.hooks.email.send(
            'bookingEmail',
            {
                name: client.firstName
            },
            {
                to: client.email,
                subject: client.subject
            },
            function (err) {
                console.log(err || 'Mail Sent !');
            }
        )
        
        
         return res.view('flight/confirmation', {fligthCodes: fligthCodes,
                                                        reservations: reservations,
                                                        clients: clients});
        
        /*Client.create(clients).exec(function(err, savedClients) {
            console.log(savedClients);

            
            if (err) {
                return res.view('500');
            }
            
            
            console.log('RESERVATIONS');
            console.log(reservations);
            
            console.log('SAVED CLIETNS');
            console.log(savedClients);
            
            Reservation.create(reservations).exec(function(err, savedReservations) {
                if (err) {
                    console.log('ERROR:');
                    console.log(err);
                }
                
                console.log('in reservation');
                
                
                
                console.log(savedClients.length + ' Saved Clients'); 
                console.log("CONSOLE CODES");
                console.log(fligthCodes);
                return res.view('flight/confirmation', {fligthCodes: fligthCodes,
                                                        reservations: reservations,
                                                        clients: clients});
                    
            });
            
            
        
            
        });*/
        
        
    }
}
;
