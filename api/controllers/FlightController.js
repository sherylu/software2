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
        

        var myData = JSON.parse(req.param('data'));
        

        var clients = myData.obj;
        var seats = myData.numberOfSeats;
        var fligthCodes = myData.reservation;
        var client = clients[0];

        var reservation = { quantity: seats,
                            creationDate: new Date(),
                            state: "Payment Pending"
                          }
        
        var reservations =  fligthCodes.map(function(code) {
                                var newReservation = reservation;
                                newReservation.flightCode = code;
                                return newReservation; 
                            });
                            

        Reservation.create(reservations)
            .then(function(persistedReservations){
                
                clients = clients.map(function(client) {
                    var newClient = client;
                    newClient.reservations = persistedReservations;
                    return newClient;
                });
                
                var passportIds = clients.map(function(client) {
                    return {passportId: client.passportId}
                });
                
                
                Client.findOrCreate(passportIds, clients)
                    .then(function(persistedClients) {
                        
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
                        );
                        
                        
                        return res.view('flight/confirmation', { reservations: persistedReservations,
                                                          clients: persistedClients
                                                         });
                    
                    })
                    .catch(function(err) {
                        res.serverError(err);
                    });
                
            })
            .catch(function(err) {
                res.serverError(err);
            });
        
    }
}
;
