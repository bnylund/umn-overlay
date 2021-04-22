# UMN Overlay

This repository holds all of the scenes. If you want to create a new scene, create a folder in this directory (named exactly as you want the scene to be named) and create a file called overlay.html. The directory you create can ONLY contain an overlay.html file and an img/ folder to store your assets. All styles and scripts must go inside of overlay.html.

Your root element in your overlay.html file must be `<rl-scene>`. you must pass a name attribute in the definition that matches your directory name. Also, when you want to create ids and classes for your html elements, prefix them with your scene name so that they don't cross with other scenes. If you don't want your scene to pop up immediately when the page loads, add the attribute `hidden` to rl-scene.

There are some attributes you'll want to set on rl-scene if you want automatic transitioning as well:

```html
<rl-scene 
show-event="EVENT_NAME"
show-transition="true/false"
show-transition-rate="NUMBER"
show-delay="NUMBER"

hide-event="EVENT_NAME"
hide-transition="true/false"
hide-transition-rate="NUMBER"
hide-delay="NUMBER" />
<!-- *-delay (in ms) default: 0, *-transition-rate default: 1, *-transition default: false -->
```

There is a global variable called Relay that you can access in your script, structured as the following:

```
Relay.
    server: string,
    socket: SocketIOClient,
    id: string,
    socketStatus: SocketStatus,
    addListener(event, cb): function
```

Currently Relay.addListener only supports status_changed as of now, which can be shown below:

```javascript
Relay.addListener("status_changed", (data) => {
    // data["status"] -> DISCONNECTED, CONNECTING, or CONNECTED
    // data["server"] -> Current server
});
```

There are 3 classes that are given to you from the overlay that you can use:

```css
.overlay {
    width: 100%;
    height: 100%;
    border: none;
    position: absolute;
    top: 0px;
    left: 0px;
    background-color: rgba(0, 0, 0, 0);
    margin: 0px auto;
    overflow: hidden;
}
.montserrat-bold {
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
}
.montserrat {
    font-family: 'Montserrat', sans-serif;
}
```

Finally, the overlay provides [Bootstrap 4.0](https://getbootstrap.com/docs/4.0/getting-started/introduction), [jQuery](https://jquery.com), [socket.io v3](https://socket.io/docs/v3/client-api/index.html), and [Animate.css](https://animate.style/#documentation).

alright enough silly talk, its EXAMPLE TIME

## Example Scene (WAITING)

```html
<!-- ./WAITING/overlay.html -->
<style>
    #waiting-div {
        background-color: #BC3232;
    }
    .waiting-popup {
        width: 350px;
        height: 75px;
        margin: 20px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-shadow: 5px 5px 5px #222;
        -webkit-transition: background-color 0.5s ease-in-out;
        -moz-transition: background-color 0.5s ease-in-out;
        -o-transition: background-color 0.5s ease-in-out;
        -khtml-transition: background-color 0.5s ease-in-out;
        transition: background-color 0.5s ease-in-out;
    }
    .waiting-popup p {
        margin: 0;
    }
</style>

<!-- This is our "default" scene, so we don't add hidden -->
<rl-scene name="WAITING" hide-event="game:match_created" class="overlay">
    <div id="waiting-div" class="waiting-popup">
        <p id="waiting-status" style="font-size:20px;">Relay disconnected.</p>
        <p id="waiting-connecting" style="font-size: 17px;">Trying to connect...</p>
    </div>
</rl-scene>

<script>
    Relay.addListener("status_changed", (data) => {
        if(data["status"] === "CONNECTED") {
            document.getElementById('waiting-connecting').style.display = "none";
            document.getElementById('waiting-status').innerText = "Relay Connected!";
            document.getElementById('waiting-div').style.backgroundColor = "#4CDB81";
        } else if(data["status"] !== "INITIALIZED") {
            document.getElementById('waiting-connecting').style.display = "block";
            document.getElementById('waiting-status').innerText = "Relay Disconnected.";
            document.getElementById('waiting-div').style.backgroundColor = "#BC3232";
        } else {
            // Relay.socket.on() events here
            // This will only be ran if status is INITIALIZED (only happens once so don't miss it)
        }
    });
</script>
```