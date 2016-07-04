/**
 * HomepageController
 *
 * @description :: Server-side logic for managing homepages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: function(request, response) {
		
		Airport.find().exec(function(err, allAirports){
	        if(err || allAirports === undefined) {
	            allAirports = [];
	        }      
            return response.view('homepage', {airports: allAirports,
            	                              errors: []}
        	);
	    })
		
	},
};

