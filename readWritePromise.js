const fs = require('fs')

const read = (filename) => {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, (err, buf) => {
			if(err) { reject(err) } 
			else { resolve(buf.toString()) }
		})
	})
}

const write = (filename, data) => {
	return new Promise((resolve, rejenct) => {
		fs.writeFile(filename, data, (err) => {
			if(err) { reject(err) }
			else { resolve() }
		})
	})
}

module.exports = {
	read,
	write
}