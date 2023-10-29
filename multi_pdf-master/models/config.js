const mongoose = require('mongoose');
mongoose.connect(`${config.db.url}/${config.db.db}`, config.db.options);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Se ha establecido conexión con la base de datos')
  /* 
   * We are connected !
   * console.log(config.db)
   * Recolectar información sobre el server al que está conectado
   * y la última vez que se accedió al mismo
   */ 

});