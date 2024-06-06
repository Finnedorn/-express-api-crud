// creo una classe che estenda la classe Error
//  così da poter raccogliere eventuali errori generati durante le chiamate API
// e personalizzare il messaggio da restituire
class RestErrorFormatter extends Error {
    constructor(statusCode, message) {
        // super() estende l'argomento message la classe Error così da poterlo usare
        super(message);
        // aggiunge la proprietà statusCode
        this.statusCode = statusCode;
    }
}

module.exports = RestErrorFormatter