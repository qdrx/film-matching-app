# **Socket Events**

The client-side application can emit the following events to the server:

`createRoom` -
The createRoom event is used to request the creation of a new room. The client must pass an array of film preferences to the server. When the server receives the event, it generates a new room ID, creates a new room with the generated ID, retrieves a list of films from the database based on the client's film preferences, adds the films to the room, and emits the `roomCreated` event to the client with the generated room ID.

`joinRoom` -
The `joinRoom` event is used to request to join an existing room. The client must pass the room ID to the server. When the server receives the event, it retrieves the room with the given ID, adds the client's socket ID to the room's users list, and emits the roomJoined event to the client with the room ID. The server also emits the `films` event to the client with the list of films in the room.

`disconnect`
The disconnect event is emitted by the server when a client disconnects from the server.

# Socket Events Received by Client

The client-side application can receive the following events from the server:

`roomCreated` -
The `roomCreated` event is emitted by the server when a new room is created. The event handler in the client-side application can use the generated room ID to join the room.

`roomJoined` -
The `roomJoined` event is emitted by the server when the client has successfully joined a room. The event handler in the client-side application can use the room ID to display the room information to the user.

`films` -
The `films` event is emitted by the server when the client has successfully joined a room. The event handler in the client-side application can use the list of films to display them to the user.