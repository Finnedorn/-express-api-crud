// funzione per gestire le req a rotte non esistenti
const notFoundFormatter = (req,res) => {
    res.status(404).send("Rotta non trovata o non esistente");
}

module.exports = notFoundFormatter;