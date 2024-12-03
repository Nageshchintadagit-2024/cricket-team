const express = require('express')

const path = require('path')

const app = express()

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

app.use(express.json())

initializeDbAndServer()

// API 1 get all players API

const dbObjectToResponseObjectConversion = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
    
    SELECT * FROM cricket_team ORDER BY player_id
    
    `
  const playersArray = await db.all(getAllPlayersQuery)

  const resultResponse = playersArray.map(each =>
    dbObjectToResponseObjectConversion(each),
  )

  response.send(resultResponse)
})

// API 2 create a player

app.post('/players/', async (request, response) => {
  const dataObject = request.body
  const {playerName, jerseyNumber, role} = dataObject
  const addPlayerQuery = `
  
  INSERT INTO cricket_team 
     ( player_name,jersey_number,role)

     VALUES ('${playerName}',${jerseyNumber},'${role}')
  
  `
  await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

// API 3 get player details

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    
    SELECT * FROM cricket_team WHERE player_id=${playerId}
    
    `
  const playerObject = await db.get(getPlayerQuery)

  const resultResponse = dbObjectToResponseObjectConversion(playerObject)

  response.send(resultResponse)
})

//API 4 update player details

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const dataObject = request.body
  const {playerName, jerseyNumber, role} = dataObject
  const updatePlayerSDetailsQuery = `
    
     UPDATE cricket_team 
     SET player_name='${playerName}' ,jersey_number=${jerseyNumber}, role = '${role}'
     WHERE player_id = ${playerId}
    `
  await db.run(updatePlayerSDetailsQuery)
  response.send('Player Details Updated')
})

// API 5 delete a player

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
    
    DELETE FROM cricket_team WHERE player_id=${playerId}
    
    `
  await db.run(deleteQuery)

  response.send('Player Removed')
})


module.exports = app