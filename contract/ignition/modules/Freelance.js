// ignition/modules/FreelanceEscrow.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("FreelanceModule", (m) => {
  // Definiamo il contratto che vogliamo distribuire
  const freelance = m.contract("Freelance");

  // Restituiamo il riferimento al contratto distribuito
  return { freelance };
});