# DumbChain

Basic Blockchain to try to understand how it works :) 

It's based on the excellent work of [lhartikk](https://github.com/lhartikk/naivechain)

## Setup

```
npm install
```

## Start it

Start as many instances as you like to emulate a real peer to peer network.
If you work on the same host, change the ports (http and websocket).


```
node app.js 3001 6001
```

## Add a peer

Example with a second peer listening on port 6002
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6002"}' http://localhost:3001/peer/add
```

## List connected peers

```
curl http://localhost:3001/peer
```

## Adding data block

```
curl -d '{"data":"Bonjour"}' localhost:3001/mine -H "Content-Type: application/json"
```
