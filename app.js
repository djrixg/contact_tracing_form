async function registerSW(){
	if('serviceWorker' in navigator){
		// alert("Press Options and Click Add to Homescreen to use this even offline.");
		navigator.serviceWorker.register("sw.js")
		.then((reg) => console.log("service worker registered\nReg:",reg))
		.catch((err) => console.log("service worker not registered\nErr:",err));
	}
}