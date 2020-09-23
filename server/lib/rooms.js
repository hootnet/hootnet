const users = require('./users');
const rooms = {}
/* A room is a named object with a list of members and the identity of the last to join
*/
// exports.all = () => {
//     return rooms
// }

exports.exists = (roomName) => {
  return rooms[roomName]
}
// exports.clearRoom = (roomName) => {
//     const room = exports.exists(roomName)
//     if (!room || !room.cascade) return
//     room.cascade.map((member, sequence) => {
//         console.log("clear", member)
//         const socket = users.getReceiver(member)
//         if (socket) {
//             socket.emit("end", {})
//         }
//         else {
//             console.log("Socket dropped")
//         }
//     })
// }
// exports.computeCascade = (roomName) => {
//     const room = exports.exists(roomName)
//     let cascade = []
//     delete room.members[null]
//     Object.keys(room.members).map(key => {
//         const control = users.getControlOf(key)
//         const seq = parseInt(control)
//         if (seq) {
//             if (!cascade[seq]) cascade[seq] = []
//             cascade[seq].push(key)
//         }
//     })
//     room.cascade = cascade.flat().filter(a => a)
// }




exports.create = (roomName) => {
  if (!rooms[roomName]) rooms[roomName] = { count: 0, members: {}, order: [] }
}
exports.join = (roomName, id) => {
  const room = exports.exists(roomName)
  if (room.members[id]) return
  room.members[id] = {}
}
exports.leave = (roomName, id) => {
  const room = exports.exists(roomName)
  if (room) delete room.members[id]
}
// exports.lastId = (roomName) => {
//     return exports.exists(roomName).lastId
// }

exports.members = (roomName) => {
  const room = exports.exists(roomName)
  if (room && room.members) return Object.keys(room.members)
  return []
}

// exports.cascade = (roomName) => {
//     const room = exports.exists(roomName)
//     if (room) {
//         return room.cascade
//     } else {
//         return []
//     }
// }

exports.sendToMembers = (roomName, event, data) => {
  const room = exports.exists(roomName)
  console.log("MEMBERS ", roomName, exports.members(roomName))
  exports.members(roomName).forEach(id => {
    const socket = users.getReceiver(id)
    if (socket) {
      socket.emit(event, data)
    }

  })

}

