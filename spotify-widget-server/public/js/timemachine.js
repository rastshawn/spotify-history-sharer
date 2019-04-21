document.addEventListener("DOMContentLoaded", (e) => {

    let from = document.getElementById('from');
    let to = document.getElementById('to');
    let submit = document.getElementById('submit');

    let display = document.getElementById('display');

    console.log('ready');
    from.addEventListener('change', (e) => {
        //console.log('from changed');
    });

    to.addEventListener('change', (e) => {
        //console.log('to changed');
    });

    submit.addEventListener('click', (e) => {
        let fromDate = (from.value) ? new Date(from.value) : new Date('01/01/2019');
        let toDate = (to.value) ? new Date(to.value) : new Date();

        if (fromDate > toDate) {
            // todo 
            alert('TO must be after FROM');
        }

        console.log(`From: ${fromDate}, To: ${toDate}`)

        let src = `/users/${userID}/history`;
        display.src = src;
    });
});