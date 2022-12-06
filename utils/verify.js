const { run } = require("hardhat")

async function verify(contracAddress, arg) {
  console.log("verifying contract", contracAddress)
  try {
    console.log("started contract", arg)
    await run("verify:verify", {
      address: contracAddress,
      constructorArguments: arg
    })
  } catch (e) {
    console.log("error verify contract", e)

    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!")
    } else {
      console.log("error verify contract")
      console.log(e)
    }
  }
  console.log("verifying contract")
}

module.exports = { verify }
