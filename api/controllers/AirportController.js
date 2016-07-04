/**
 * AirportController
 *
 * @description :: Server-side logic for managing airports
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	listAll: function (req, res) {
	    Airport.find().exec(function(err, airports){
	        if(err) {
	            return res.json({
	                error: err
	            });
	        }      
	        if (airports === undefined) {
	            return res.notFound();
	        }
	        else {
	            return res.json(airports);
	        }
	    })
	}
};

