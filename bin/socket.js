const randomize = require("randomatic");

var offerts = [];

function generateRandCode() {
  return randomize("A", 5);
}

function initialize(io) {
  io.on("connection", cliente => {
    console.log("usuario conectado");

    /**
     * ===== Offer events =====
     */
    /**
     * First event fired after connect and create offer
     */
    cliente.on("assing-offer-code", (offer, callback) => {
      console.log("assing-offer-code");
      let code = generateRandCode();
      offerts.push({
        cliente,
        offer,
        code
      });
      callback(code);
    });

    /**
     * ===== Answer events =====
     */
    /**
     * When user insert rand code
     */
    cliente.on("answer-want-connect", (code, callback) => {
      console.log("find-and-connect");
      let offer = offerts.find(offer => offer.code === code);
      callback(offer.offer);
    });

    /**
     * When Answer signaled to Offer and waits for Offer to signalize it
     * data contain {answer, code}
     */
    cliente.on("answer-want-offer-signal", data => {
      let offer = offerts.find(offer => offer.code === data.code);
      offer.cliente.emit("answer-signal", data.answer);
    });

    cliente.on("disconnect", () => {
      offerts = offerts.filter(offert => offert.cliente.id !== cliente.id);
      console.log("usuario desconectado");
    });
  });
}

module.exports = initialize;
