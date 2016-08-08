/**
 * ReservationController
 *
 * @description :: Server-side logic for managing reservations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    consult: function(req, res) {
        res.view('reservation/consult');
    },
    
    getinfo: function(req, res) {
        var code = req.param('reservationCode');
        Reservation.findOne({code: code}).populate('owners')
        .then(function(reservation) {
            res.view('reservation/info', {reservation: reservation});
        })
        .catch(function(err) {
            res.serverError(err);
        });
    }
};

