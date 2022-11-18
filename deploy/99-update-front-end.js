const { frontEndContractsFile, frontEndAbiFile } = require("../helpers.hardhat-config")
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const surpay = await ethers.getContract("Surpay")
    fs.writeFileSync(frontEndAbiFile, surpay.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const surpay = await ethers.getContract("Surpay")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(surpay.address)) {
            contractAddresses[network.config.chainId.toString()].push(surpay.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [surpay.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]