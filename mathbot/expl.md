## Bot

- Cada mensage es recibido y procesado por `Incoming Middleaware Chain (Middleware de Cadena Entrante)` 
- Cada mensage de salida es procesado y enviado por `Outgoing Middleware Chain (Middleware de Cadena Saliente)` 

***Middleware Chain*** Es una lista ordenada de `middleware functions`. Esta funcioness dictan como el Bot reacciona a mensajes enviados y recibidos. 

Para escuchar for mensajes entrantes se usa `bp.hear` helper. Para responder mensaejs se usar `event.reply` UMM feature.

***Nota*** `hear` no es conveniente para conversaciones complejas.

### Enviando mensajes

llamado como `Outgoing`. Hay dos formas para enviar mensajes. Reaccionando a mensajes entrantes (`Reactive Outgoing`) o en otro momento (`Proactive Outgoing`)

### Conversación

La conversación se divide en dos partes:

- Flow
- Content

#### Flow

`Como` el bot procesa mensajes entrantes de acuerdo al estado de la conversación y el contexto.

- Ausente(Absent) Carente de funciones de conversacion
- Static Decisión Tree (`if-else`)
- Dynamic Decisión Tree (Basado en Statistical Models)

#### Content

Es que y como el bot _hablar_ a los usuarios 

### Flow

Flow Manager = (convo)

`Api.ai`y `wit.ai` pueden ser usadas por su `Flow Managment System` y no precisamente por el  `NLP`, del cual es complementario.

`bp.convo.start(event, (convo) { //confirure  })`

#### Convo.threads

Es un mapa de solo lectura que contiene todos los `threads` en la conversación. Obtener thread:
`convo.threads.[name]`.

#### convo.set(name, value)

Agregar una variable a la conversación. 
`bp.convo.start(event, convo => { convo.set('name', event.user.first_name) })`

Es obtenida con `convo.get('name')`

- `convo.says(block, [data])` Encola un bloque UMM para enviar

- `convo.repeat()` Repite el último mensaje

- `convo.next()` Continua la ejecución del actual `thread`

- `convo.switchTo(threadName)` Cambia al `thread` indicado. `next()` es ejecutado. Mensajes en cola serán enviados

`convo.stop([string_reason])` Detiene la conversación. Detiene procesamiento de mensajes entrantes.

 `convo.messageTypes` _GET_ o _SET_ el tipo de mensaje que será tratado como una respuesta

`convo.messageTypes = ['postback]` hará que la conversación solo escuche para Messenger Postbacks

Defaults: ['text', 'message']

***tip*** Si se queire capturar clic de botones (postback) o respuestas rápidas: `convo.messageTypes = ['postback', 'quick_reply', 'message', 'text']`


#### JsonSchema - UISchema
[https://github.com/mozilla-services/react-jsonschema-form]
