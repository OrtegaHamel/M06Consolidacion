const chai = require("chai");
const { servidor, port } = require("./index.js")


describe("Pruebas al servidor Node", () => {
    it("Creación del servidor", () => {
        chai.expect(servidor).to.be.a('object');
    })

    it("Definición y validación de puerto", () => {
        chai.expect(port).to.be.a("number");
    })
})

