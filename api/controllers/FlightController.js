/**
 * FlightController
 *
 * @description :: Server-side logic for managing flights
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    
    search: function(req, res) {
        var departureAirport = req.param('departure');
        var arrivalAirport   = req.param('arrival');
        var tripOption       = req.param('optionsRadios');
        var seatAdult        = parseInt(req.param('seats'));
        var seatChild        = parseInt(req.param('seatschild'));
        var seatToddler      = parseInt(req.param('seatstod'));
        var flightDeparture  = new Date(req.param('startDate'));
        var flightArrival    = new Date(req.param('endDate'));
        var totalseats       = seatAdult + seatChild;
        
        //TODO: validate request method
        var values = req.allParams();
        var errorsMsg = Flight.validateForm(values);
        

        if (errorsMsg.length>0) {
            Airport.find().exec(function(err, allAirports){
    	        if(err || allAirports === undefined) {
    	            allAirports = [];
    	        }      
    	        else {
    	            if (req.method === 'GET') { errorsMsg = [] }
    	            return res.view('homepage', {airports: allAirports,
    	                                           errors: errorsMsg}
    	                              );
    	        }
    	    })
        } else {
            
        
        Flight.find({departureDate: { '>=': flightDeparture}}).
            populate('seats', {where: {available: true}}).
            populate('departureAirport').
            populate('arrivalAirport').
                exec(function(err, departureFlights) {
                    if (err) {
                        return res.negotiate(err);
                    }
                    if (departureFlights === undefined) {
                        errorsMsg.push('No se encontraron vuelos disponibles para la salida')
                        res.view('flight/search', { errors: errorsMsg,
                                                    departures: [],
                                                    arrivals: []
                        });
                    } else {
                        departureFlights = departureFlights.filter(function(f) {
                                                return f.seats.length > totalseats
                                                         }).filter(function(f) {
                                                return f.departureAirport.code == departureAirport             
                                                         }).filter(function(f) {
                                                return f.arrivalAirport.code == arrivalAirport
                                                         });
                                                         
                                
                        res.view('flight/search', {errors: errorsMsg,
                                                   departures: departureFlights,
                                                   arrivals: []
                        });
                    }
                    
                });
        }
    }
	
};

