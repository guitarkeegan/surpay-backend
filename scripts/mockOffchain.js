const { ethers, network } = require("hardhat")

async function mockAutomation() {
    const surpay = await ethers.getContract("Surpay")
    const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    const { upkeepNeeded } = await surpay.callStatic.checkUpkeep(checkData)
    if (upkeepNeeded) {
        const tx = await surpay.performUpkeep(checkData)
        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.events[1].args.requestId
        console.log(`Performed upkeep with RequestId: ${requestId}`)
    } else {
        console.log("No upkeep needed!")
    }
}

mockAutomation()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })