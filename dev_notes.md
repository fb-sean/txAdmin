## TODO:
- [x] fixed server log text invisible on light theme
- [ ] xxxxxxxxxxxxx
- [ ] xxxxxxxxxxxxx
- [ ] xxxxxxxxxxxxx
- [ ] xxxxxxxxxxxxx
- [ ] new console log
- [ ] change CitizenFX to Cfx.re as per branding consistency (ask the elements)
- [ ] fix menu playerlist
- [ ] fix menu auth
- [ ] MAYBE: remove the "NEW" tag from `header.html` and `masterActions.html`




> User report: when admin use txadmin for first time, system ask him to change password, if he change it, all admins must restart to get txadmin working again

> We could totally do like a "jump in time" feature for the log page.
> A slider with 500 steps, and an array with 500 timestamps
> this array can be done by dividing the serverLog.length to get the step, then a for loop to get the timestamps


https://cdn.discordapp.com/attachments/589106731376836608/892124286360383488/unknown.png
remover o \s?



### Menu auth fix
- o `/auth/nui` vira um middleware requestAuth('nui')
- esse middleware cria uma variável de contexto que não é ctx.session pra nao ficar criando sessões koa
- usar handlers normais (webRoutes.player.*), e dentro delas fazer `const sess = ctx.nuiSess || ctx.session` 
- criar rotas novas com prefixo diferente tipo `/nui/xxx`
- webpipe adicionar headers com identifiers quando tiver path começar com `/nui/`

- o sv agora vai ter que começar a chamar algo tipo `/nui/identify` no join pra saber se esse o client é admin 
- remover `/auth/nui` existente
- fazer o react parar de chamar e depender do `/auth/nui`
- iframe iniciar com uma rota especial que ou gera o ctx.session (como o `/auth/nui`), ou já chama o handler do serverlog get

- talvez cachear os identifiers pra nao ficar pegando toda vez? talvez no primeiro `/nui/identify` retornar um token que pode ser reusado sem ter que ficar buscando admin com mesmo id? idk



### txAdmin API/integrations:
- ban/warn/whitelist + revoke action: probably exports with GetInvokingResource() for perms 
- get player info (history, playtime, joindate, etc): state bags
- events: keep the way it is
> Note: confirm with bubble
> Don't forget to add a integrations doc page + to the readme
> for menu and internal stuff to use token-based rest api: ok, just make sure to use the webpipe proxy
> for resource permissions, use resource.* ace thing, which also works for exports

> for ban things, bubble wants a generic thing that is not just for txadmin, so any resource could implement it
> so its not exports.txadmin.xxxx, but some other generic thing that bubble would need to expose

> querying user info: in-server monitor resource should set specific state keys (non-replicated), which get properly specified so other resources can also populate any 'generic' fields. thinking of kubernetes-style namespaces as java-style namespaces are disgusting (playerdata.cfx.re/firstjoin or so)
> bans: some sort of generic event/provide-stuff api. generic event spec format is needed for a lot of things, i don't want 'xd another api no other resource uses', i just want all resources from X on to do things proper event-y way
> --bubble
https://docs.fivem.net/docs/scripting-manual/networking/state-bags/

ps.: need to also include the external events reporting thing


### Admin ACE sync:
On server start, or admins permission change:
- write a `txData/<profile>/txAcePerms.cfg` with:
    - remove_ace/remove_principal to wipe old permissions (would need something like `remove_ace identifier.xxx:xx txadmin.* any`)
    - add_ace/add_principal for each admin
- stdin> `exec xxx.cfg; txaBroadcast xxxxx`

- We should be able to get rid of our menu state management, mainly the part that sends to lua what are the admin ids when something changes
To check of admin perm, just do `IsPlayerAceAllowed(src, 'txadmin.xxxxxx')`
> Don't use, but I'll leave it saved here: https://github.com/citizenfx/fivem/commit/fd3fae946163e8af472b7f739aed6f29eae8105f


### Admin gun
An "admin gun" where you point a gun to a player and when you point it to a player it shows this player's info, and when you "shoot it" it opens that player's modal.
If not a custom gun model, just use the point animation and make sure we have a crosshair


### ESM updates
dateformat      esm
boxen           esm
jose            apparently cjs is available, but does zap even plan on using it?
lowdb           esm - complicated
slash           esm
windows-release esm
NOTE: nice guide https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c


### recipe engine todo:
- checksum for downloaded files
- remove_path accept array?
- every X download_github wait some time - maybe check if ref or not, to be smarter
- https://github.com/isomorphic-git/isomorphic-git
- easy recipe tester
- fully automated deploy process via CLI. You just set the recipe file path, as well as the required variables, and you can get your server running without any user interaction .

### Todozinhos:
pagina de adicionar admin precisa depois do modal, mostrar mais info:
username, senha, potencialmente link, instruções de login

warn auto dismiss 15s
FreezeEntityPosition need to get the veh
debugModeEnabled and isMenuDebug are redundant, should probably just use the one from shared





=======================================
### old stuff:::
- precisamos garantir que uma sessão criada via NUI seja só usada com nui
- criar um novo token, mudar no primeiro tick
- desabilitar master actions pra quando for NUI

Small Stuff:
- [ ] try json stream on lowdb
- [ ] menu: add debouncer for main options keydown
- [ ] menu: fix heal self/server behavior inconsistent with player mode and teleport
- [ ] block execution if GetCurrentResourceName() != 'monitor'
- [ ] player modal must show if the user is banned/whitelisted or not, and an easy way to revoke it
- [ ] check EOL and warn user - new Date('2021-09-14T07:38:51+00:00').getTime()
- [ ] on recipe import, check if indexOf('<html>')
- [ ] enable squirrelly file caching via `renderFile()`
- [ ] make the commands (kick, warn, etc) return success or danger, then edit DialogActionView.tsx
    - can be done by adding a randid to the command, then making the cmdBuffer match for `<id><OK|NOK>` 

- [ ] break `playerController` actions stuff to another file
- [ ] if isZapHosting && forceInterface, add `set sv_listingIPOverride "xxx.xxx.xxx.xxx"` in deployer
- [ ] maybe remove the sv_maxclients enforcement in the cfg file
- [ ] fix the interface enforcement without port being set as zap server?


> ASAP!:
- [ ] a way to create admins file without cfx.re 
- [ ] add discord group whitelist (whitelist switch becomes a select box that will enable guildID and roleID)
    - Manual Approval (default)
    - Discord: be in guild
    - Discord: have a role in guild
- [ ] persistent discord status message that is set up by `/statusfixed`:
    - this will trigger a big status message to be sent in that channel
    - this message id can be stored in the config file
    - if discord id is present, use that instead of name (careful with the pings!)
- [ ] (really needed?) ignore key bindings commands https://discord.com/channels/577993482761928734/766868363041046589/795420910713831446
- [ ] add custom event for broadcast


> Hopefully now:
- [ ] check the places where I'm doing `Object.assign()` for shallow clones
- [ ] remove the ForceFXServerPort config and do either via `server.cfg` comment, or execute `endpoint_add_tcp "127.0.0.1:random"`
- [ ] create `admin.useroptions` for dark mode, welcome modals and such

> Soon™ (hopefully the next update)
- [ ] get all functions from `web\public\js\txadmin\players.js` and wrap in some object.
- [ ] maybe hardcode if(recipeName == plume) to open the readme in a new tab
- [ ] add new hardware bans
- [ ] add stats enc?
- [ ] apply the new action log html to the modal
- [ ] add `<fivem://connect/xxxxx>` to `/status` by getting `web_baseUrl` maybe from the heartbeat
- [ ] add ban/whitelist fxs-side cache (last 1000 bans + 1000 whitelists), automatically updated
    - before starting the server, get last 1k bans/whitelists and write to a json file
    - quen monitor starts, it will read the file and load to memory
    - start sending the affected identifiers for the events `txAdmin:events:*` whitelisted, banned, and create a new for action revoked (type, action id).
    - monitor listens to the event, and when it happens either add it to the cache, or erase from cache
- [ ] add a commend system?
- [ ] add stopwatch (or something) to the db functions and print on `/diagnostics`

> Soon™® (hopefully in two months or so)
- [ ] tweak dashboard update checker behavior
- [ ] add an fxserver changelog page
- [ ] Social auth provider setup retry every 15 seconds
- [ ] show error when saving discord settings with wrong token
- [ ] break down `playerController` into separate files even more
- [ ] rename `playerController` to `playerManager`?

=======================================

## FXServer Stuff + TODOs

### Rate limiter
We could be more sensible when restarting the server and pushing an event to alert other resources thatm ight want to auto block it.
```bat
netsh advfirewall firewall add rule name="txAdmin_block_XXXX" dir=in interface=any action=block remoteip=198.51.100.108/32
netsh advfirewall firewall show rule name="txAdmin_block_XXXX"
netsh advfirewall firewall delete rule name="txAdmin_block_XXXX"
```
https://github.com/citizenfx/fivem/search?q=KeyedRateLimiter


### Oversized resources streams
We could wait for the server to finish loading, as well as print in the interface somewhere an descending ordered list of large resource assets
https://github.com/citizenfx/fivem/blob/649dac8e9c9702cc3e293f8b6a48105a9378b3f5/code/components/citizen-server-impl/src/ResourceStreamComponent.cpp#L435


### Spectating with routing bucket:
Message from bubble:
> the obvious 'approach' works well enough:
> - get target routing bucket on server
> - save old source
> - teleport source player to in scope
> - send event to source client
> ------- client -------
> - set focus pos and vel, less shit than 'xd teleport' and should trip server to cull anyway
> - make self invisible/such
> - wait for target player to exist
> - use spectate native
> and when stopping spectating do the opposite of that



=======================================

## Bot Commands:
https://www.npmjs.com/package/eris - avarianknight recommended

DONE:
/addwl <wl req id>
/addwl <license>

TODO: Bot commands (in dev order):
/kick <mention>
/log <mention> - shows the last 5 log entries for an discord identifier (make it clear its only looking for the ID)
/ban <mention> <time> <reason>
/unban <ban-id>

/info - shows your info like join date and play time
/info <mention> - shows someone else's info
/addwl <mention>
/removewl <mention>

=======================================

## Video tutorials
Requirements:
    - 2 non-rp recipes
    - Separate master actions page
### [OFFICIAL] How to make a FiveM Server tutorial 2021 for beginners!
Target: absolute beginners, barely have a vps
- Requirements:
    - Needs to be a VPS (show suggestion list)
    - OS: windows server 2016 or 2019 recommended
    - Hardware specs recommendation
    - Download Visual C++
    - You need a forum account (show page, don't go trough)
    - Create server key
    - Download xamp (explain most servers require, show heidisql page)
- Open firewall ports (show windows + OVH)
- Download artifact (show difference between latest and latest recommended)
- Set folder structure
- Run txAdmin (should open chrome, if it doesn't, then open manually)
- Open page outside VPS to show the ip:port thing
- Create master account
- Setup:
    - Present options
    - Run PlumeESX recipe
    - Master Actions -> Reset FXServer Settings
    - Setup local folder (show endpoint + server.cfg.txt errors)
- Show how to create admins
- Callout for advanced tutorial
### [OFFICIAL] How to update your FiveM Server tutorial 2021
Target: server owners that followed the stupid Jeva tutorial
- Why windows only
- Show current stupid folder structure
- Download artifact (show difference between latest and latest recommended)
- Set new folder structure
- Run txAdmin (should open chrome, if it doesn't, then open manually)
- Create master account
- Setup (show endpoint + server.cfg.txt errors)
- Show how to create admins
- Open firewall port 40120 (show windows + OVH)
- Callout for advanced tutorial
### [OFFICIAL] txAdmin v3 advanced guide 2021
Target: average txAdmin users
- creating admins
- multiple servers
- discord bot
- discord login
- database pruning 
- scheduled restarter

=======================================

## References

### CoreUI Stuff + Things I use
https://simplelineicons.github.io
https://coreui.io/demo/3.1.0/#icons/coreui-icons-free.html
https://coreui.io/demo/3.0.0/#colors.html
https://coreui.io/docs/content/typography/

https://www.npmjs.com/package/humanize-duration
https://kinark.github.io/Materialize-stepper/

https://www.science.co.il/language/Locale-codes.php


=======================================

## CLTR+C+V
```json
{
    "interface": "192.168.0.123",
    "fxServerPort": 30120,
    "txAdminPort": 40120,
    "loginPageLogo": "https://github.com/tabarra/txAdmin/raw/master/docs/banner.png",
    "defaults": {
        "license": "cfxk_xxxxxxxxxxxxxxxxxxxx_xxxxx",
        "maxClients": 48,
        "mysqlHost": "xxxxxxxxxx",
        "mysqlUser": "xxxxxxxxxx",
        "mysqlPassword": "xxxxxxxxxx",
        "mysqlDatabase": "xxxxxxxxxx"
    },
    "customer": {
        "name": "tabarra",
        "password_hash": "$2y$12$WNuN6IxozL4CjgScsLvmGOmxtskg8EcPe67HtUw0ENeCCSaZ.z3AW"
    },

    "interface-": false,
    "loginPageLogo-": false,
    "customer-": false
}
```

```bash
# run
export CURR_FX_VERSION="3247"
alias cdmon="cd /e/FiveM/builds/$CURR_FX_VERSION/citizen/system_resources/monitor"

nodemon +set txAdminVerbose truex
nodemon +set txDebugPlayerlistGenerator truex +set txAdminVerbose truex
nodemon +set txDebugPlayerlistGenerator true +set txAdminRTS "deadbeef00deadbeef00deadbeef00deadbeef00deadbeef" +set txAdminVerbose truex
nodemon +set txDebugPlayerlistGenerator true +set txDebugExternalSource "x.x.x.x:30120" +set txAdminVerbose truex
npm run dev:menu:game

# build
rm -rf dist && npm run build && explorer dist
# fix this command later, the zip generated is too big and malformed
rm -rf dist && npm run build && tar.exe -cvf dist/monitor.zip dist/* && explorer dist

# other stuff
export TXADMIN_DEFAULT_LICENSE="cfxk_xxxxxxxxxxxxxxxxxxxx_xxxxx"
npm-upgrade
con_miniconChannels script:monitor*
+set svgui_disable true +setr txAdminMenu-debugMode true +setr txEnableMenuBeta true

# eslint stuff
npx eslint ./src/**
npx eslint ./src/** -f ./lint-formatter.js
npx eslint ./src/** --fix

# hang fxserver (runcode)
console.log('hanging the thread for 60s');
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60 * 1000);
console.log('done');

# check chart
cdt
cd web/public/
curl -o svMain.json http://localhost:40120/chartData/svMain
```
Don't commit:
ver se o bubble já criou source tracking no fd3
o problema é que um recurso malicioso pode spammar log
ou então fazer um playerJoining fake com ids fake
pelo menos garantir que dois playerJoining no mesmo id não vai sobrescrever
devido ao logger buffer, outro recurso pode mandar o mesmo id antes
talvez checar se já existe, e nesse caso pegar os IDs do playercontroller e salvar em log a discrepancia?
