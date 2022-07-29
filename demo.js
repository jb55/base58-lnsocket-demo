
async function make_request(method, rune, params) {
	const LNSocket = await lnsocket_init()
	const ln = LNSocket()

	ln.genkey()
	await ln.connect_and_init("03f3c108ccd536b8526841f0a5c58212bb9e6584a1eb493080e7c1cc34f82dad71", "ws://24.84.152.187:8324")

	const {result} = await ln.rpc({ rune, method, params })

	ln.disconnect()
	return result
}

async function rpc_invoice(params) {
	const rune = "zNKAk1B2tNIkaxJsHbhf04Qcw0CVrRNmGlW9tuo5MoA9MTAxJm1ldGhvZD1pbnZvaWNlJnJhdGU9MzAmcG5hbWVsYWJlbF5kZW1vLQ==";

	return make_request("invoice", rune, params)
}

async function wait_for_invoice(label) {
	const rune = "WVFL8uHTtC0lJiMV2kda4Qr0eBZiryJ6Un8IdGSaLr89MTAyJm1ldGhvZD13YWl0aW52b2ljZSZwbmFtZWxhYmVsXmRlbW8t"

	while (true) {
		try {
			await make_request("waitinvoice", rune, {label})
			return
		} catch {
			console.log("disconnected... trying waitinvoice again")
		}
	}
}

async function go() {
	const amount_msat = "10sat"
	const uuid = "auuid-" + new Date().getTime()
	const label = `demo-${uuid}`
	const description = prompt()

	const res = await rpc_invoice({
		label, description, amount_msat
	})

	const link = "LIGHTNING:" + res.bolt11.toUpperCase()
	const el = document.querySelector("#qrcode")
	const qr = new QRCode("qrcode", {
		text: link,
		width: 256,
		height: 256,
		colorDark : "#000000",
		colorLight : "#ffffff",
		correctLevel : QRCode.CorrectLevel.L
	})

	await wait_for_invoice(label)

	el.innerHTML = "Paid!"
}

go()
