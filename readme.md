# Mathbot

Mathbot is a chatbot with which you can practice multiplication tables. Created for children, or adults too, to practice and master the tables
in a funny way.

This branch runs with Botpress v1.1. Branch master is a port to that newer Botpress version.

There is also a version being developed using Botkit. https://github.com/roccons/hw-mathbot-botkit/

## Installation (Botpress v1.x)

__Note:__ *You can only install as a global dependency a single version of botpress (either v1.x or v10.x). If you want to run a project with another version you have to indicate the path of the local installation of botpress.*

Install botpress as a global dependency.

```
// using npm
npm install -g botpress@1.x

// using yarn
yarn global add botpresss@1.x
```

Clone this repository

`git clone git@github.com:roccons/hw-mathbot.git`

Enter the folder that was created after cloning

`cd hw-mathbot`

Checkout to branch

`git checkout botpress-v1.1`

Install the dependencies

```
// using npm
npm install

// using yarn
yarn install
```

Run the chatbot with the following command

`botpress start`

If you don't have this version of botpress installed as a global dependency, run the command like this

`node_modules/.bin/botpress start`

Enter the following address from any web browser

`http: // localhost:3002`

Say `Hi` in the chat and just follow the instructions