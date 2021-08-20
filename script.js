/*
A simple script to help declutter a Steam library and remove eligible games.
Large parts of code are taken from https://steamdb.info/freepackages/
It's the same thing as clicking every "Remove" link on the page.

Use at your own risk!
Paste this in the console on https://store.steampowered.com/account/licenses/
*/
var removeLinks = jQuery('.account_table a');
var total = removeLinks.length;
var loaded = 0;
var queue = [];
var modal = ShowBlockingWaitDialog('Starting up…',
    'Collecting eligible games.');
removeLinks.each(function (i, el) {
    queue.push(el)
});
if (queue.length == 0) {
    console.log('No removable games found!')
    modal.Dismiss();
} else {
    // Using a queue to avoid pissing off Steam - modifying the speed is NOT RECOMMENDED
    setInterval(() => {
        if (queue.length > 0) {
            var el = queue.shift();
            var match = el.href.match(/javascript:RemoveFreeLicense\( ([0-9]+), '/);
            if (match !== null) {
                var packageid = +match[1];
                jQuery.post(
                    'https://store.steampowered.com/account/removelicense',
                    {
                        sessionid: g_sessionID,
                        packageid: packageid
                    }
                ).always(function () {
                    loaded++;
                    modal.Dismiss();
                    if (loaded >= total) {
                        // All done
                        location.reload();
                    } else {
                        modal = ShowBlockingWaitDialog('Executing…',
                            'Submitted <b>' + loaded + '</b>/' + total + ' removal requests.');
                    }
                });
            } else {
                loaded++;
            }
        }
    }, 1000);
}
