// Add all soundcloud likes to a playlist by Cullen Stone
// (https://twitter.com/fold_left)
//
//
// 1. Go to https://soundcloud.com/you/likes
// 2. Open the Developer Console. (COMMAND+ALT+I on Mac)
// 3. Enter the name of the playlist to use (Line 22)
// 3. Paste this into the Developer Console and run it
//
// Last Updated: 24 January 2023
// CSS Selector to find all songs that are rendered (this will grab the entire song card)
const $songCard = '.sound.streamContext'
// CSS Selector to find all of the 'More" buttons
const $moreButtons = '.sc-button-more';
// CSS Selector for the add to playlist button
const $addToPlaylistButton = '.sc-button-addtoset';
// CSS to add to the specified playlist
const $addButton = '.addToPlaylistItem';
// CSS to verify that it is the right playlist
const $playlist = '.addToPlaylistItem__titleLink';
// PLAYLIST NAME
const playlistName = 'all likes v3'
//const playlistName = 'all likes v2'
// CSS addToList button (making sure it is the correct playlistName)
const $addToList = '.addToPlaylistButton'
// CSS Selector to find the the close button
const $closeButton = '.modal__closeButton'
// CSS Selector to find the like/unlike button
const $likeButton = '.sc-button-like'

const deleteMe = false;
const retry = {
    // Keep track of how many times the script has failed
    count: 0,
    // Set how many times the script can fail and try again before we give up
    limit: 3,
    // The number of batches to perform (this is currently set to 1)
    batches: 0
};

// This function will wait for the selector element until it is rendered/clickable.
function waitForElement(selector, callback, timeout = 5000) {
    const intervalTime = 100; // Check every 100 milliseconds
    let interval;
    let elapsedTime = 0;

    const checkElement = () => {
    const element = document.querySelector(selector);
        if (element) {
            clearInterval(interval);
            callback(element);
        } else if (elapsedTime >= timeout) {
            clearInterval(interval);
            console.error('Element not found within the timeout period');
        } else {
            elapsedTime += intervalTime;
        }
    };

    interval = setInterval(checkElement, intervalTime);
}

// scrolls to the bottom of the page
function scrollToTheBottom() {
    return window.scrollTo(0, document.body.scrollHeight);
}

// compare how many times we've retried with the maximum amount we've set
// ourselves to retry before we quit
function retryLimitReached() {
    return retry.count === retry.limit;
}

// add one to the number we're tracking of how many times we've tried again
function addNewRetry() {
    return retry.count++;
}

// add one to the batch
function addNewBatch() {
    return retry.batches++;
}

// don't do anything for the given number `seconds`, then carry on
function sleep({ seconds }) {
    return new Promise((proceed) => {
        console.log(`WAITING FOR ${seconds} SECONDS...`);
        setTimeout(proceed, seconds * 1000);
    });
}

nextBatch();

function nextBatch() {
    addNewBatch();
    if (retry.batches <= 1) {
            console.log(`ANOTHER BATCH: ${retry.batches}`)
        scrollToTheBottom()
        const allSongs = Array.from(document.querySelectorAll($songCard));
        //const moreButtons = Array.from(document.querySelectorAll($moreButtons));
        // count how many unfollow buttons were found
        const numberOfSongsToAdd = allSongs.length > 0;
        if (numberOfSongsToAdd) {
            console.log(`Trying to add ${allSongs.length} songs`);
            addToPlaylist(allSongs);
            return nextBatch();
        } else {
            addNewRetry();
        }

        if (retryLimitReached()) {
            console.log(`NO ACCOUNTS FOUND, SO I THINK WE'RE DONE`);
            console.log(`RELOAD PAGE AND RE-RUN SCRIPT IF ANY WERE MISSED`);
        } else {
            // otherwise we have more attempts to try again, so we'll give
            // Twitter/your Browser some time first...
            sleep({ seconds: 2 });
            // ..and then repeat what we just did to see if there are more users
            return nextBatch();
        }
    }

}


/*
1. I want to select the entire song card.
2. I want to add it to the playlist if it is not already
3. After this is done, close out of the popup
4. If the song was already added to the playlist (by checking if the text is 'Added'), click the unlike button
*/
function addToPlaylist(allSongs) {
    
    allSongs.forEach(function(song, index) {
        console.log(`trying to add (${index}): ${song.ariaLabel}`)
        // get the more button
        const moreButton = song.querySelector($moreButtons)
        if (moreButton) {
            moreButton.click();
        }
        sleep({seconds: 1});
        const playlistButton = document.querySelector($addToPlaylistButton);
        
        if (playlistButton) {
            playlistButton.click();
        }
        sleep({seconds: 20});
        
        // This element needs some time to appear, sleeping 20 seconds doesn't help...
        waitForElement($addButton, (element) => {
            if (element.querySelector($playlist).title = playlistName) {
                const addToListButton = element.querySelector($addToList);
                // Check if the addToListButton is 'Added' or 'Add To Playlist'
                if (addToListButton.textContent == 'Added') {
                    console.log('skipping song, already added...');
                    console.log(`UNLIKING: ${song.ariaLabel}`);
                    const unaddButton = song.querySelector($likeButton);
                    unaddButton.click()
                    
                } else {
                    console.log('Trying to add...')
                    if (addToListButton) {
                        console.log(`Adding to ${playlistName}: ${song.ariaLabel}`)
                        addToListButton.click();
                }
                }
                
                const closeOut = document.querySelector($closeButton);
                closeOut.click()

            }
        })
    
    });
}